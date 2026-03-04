import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import { generateToken, authenticateToken, hashPassword, comparePassword } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Configure Multer for image uploads
  const uploadDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({ 
    storage: storageConfig,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      if (extname && mimetype) {
        return cb(null, true);
      }
      cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, webp)"));
    }
  });

  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadDir));

  // Upload Route with manual error handling to ensure JSON response
  app.post('/api/upload', authenticateToken, (req, res) => {
    console.log(`[Server] Upload request received from user: ${(req as any).user?.username}`);
    upload.single('file')(req, res, (err) => {
      if (err) {
        console.error(`[Server] Multer error:`, err);
        if (err instanceof multer.MulterError) {
          return res.status(400).json({ message: `Error de subida: ${err.message}` });
        }
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        console.warn(`[Server] No file in request`);
        return res.status(400).json({ message: "No se ha subido ningún archivo" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      console.log(`[Server] File uploaded successfully: ${fileUrl}`);
      res.json({ url: fileUrl });
    });
  });

  // Auth Routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || !(await comparePassword(password, user.password))) {
        return res.status(401).json({ message: "Nombre de usuario o contraseña incorrectos" });
      }

      const token = generateToken(user);
      res.json({ token, user: { id: user.id, username: user.username } });
    } catch (err) {
      res.status(500).json({ message: "Error en el servidor durante el inicio de sesión" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    // Basic registration just to have an admin user
    try {
      const { username, password } = req.body;
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ username, password: hashedPassword });
      res.status(201).json({ user: { id: user.id, username: user.username } });
    } catch (err) {
      res.status(500).json({ message: "Error al registrar el usuario" });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req, res) => {
    const user = (req as any).user;
    res.json({ user: { id: user.id, username: user.username } });
  });

  app.get(api.campaigns.list.path, authenticateToken, async (req, res) => {
    const campaigns = await storage.getCampaigns();
    res.json(campaigns);
  });

  app.get(api.campaigns.getResults.path, authenticateToken, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const results = await storage.getCampaignResults(id);
      res.json(results);
    } catch (err) {
      console.error(`[Server] Error in getResults for ${req.params.id}:`, err);
      res.status(500).json({ message: "Error interno al obtener resultados" });
    }
  });

  console.log(`[Server] Registered results path: ${api.campaigns.getResults.path}`);

  app.get(api.campaigns.get.path, authenticateToken, async (req, res) => {
    const campaignId = req.params.id;
    console.log(`[Server] Campaign GET requested for id: ${campaignId}`);
    const campaign = await storage.getCampaign(Number(campaignId));
    if (!campaign) {
      return res.status(404).json({ message: "Campaña no encontrada" });
    }
    res.json(campaign);
  });

  app.get(api.campaigns.getByLink.path, async (req, res) => {
    const campaign = await storage.getCampaignByLink(req.params.uniqueLink);
    if (!campaign) {
      return res.status(404).json({ message: "Campaña no encontrada" });
    }
    res.json(campaign);
  });

  app.post(api.campaigns.create.path, authenticateToken, async (req, res) => {
    try {
      // Extend schema to coerce date strings to Date objects for SQLite/Postgres compatibility
      const bodySchema = api.campaigns.create.input.extend({
        startDate: z.coerce.date(),
        endDate: z.coerce.date()
      });
      const input = bodySchema.parse(req.body);
      const campaign = await storage.createCampaign(input);
      res.status(201).json(campaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.campaigns.update.path, authenticateToken, async (req, res) => {
    try {
      const bodySchema = api.campaigns.update.input.extend({
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional()
      });
      const input = bodySchema.parse(req.body);
      const campaign = await storage.updateCampaign(Number(req.params.id), input);
      res.json(campaign);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error && err.message === "Campaign not found") {
         return res.status(404).json({ message: "Campaña no encontrada" });
      }
      throw err;
    }
  });



  app.get(api.candidates.listByCampaign.path, async (req, res) => {
    const candidates = await storage.getCandidatesByCampaign(Number(req.params.campaignId));
    res.json(candidates);
  });

  app.post(api.candidates.create.path, authenticateToken, async (req, res) => {
    try {
      const input = api.candidates.create.input.parse(req.body);
      const candidate = await storage.createCandidate({
        ...input,
        campaignId: Number(req.params.campaignId)
      });
      res.status(201).json(candidate);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.candidates.update.path, authenticateToken, async (req, res) => {
    try {
      const input = api.candidates.update.input.parse(req.body);
      const candidate = await storage.updateCandidate(Number(req.params.id), input);
      res.json(candidate);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      if (err instanceof Error && err.message === "Candidato no encontrado") {
        return res.status(404).json({ message: "Candidato no encontrado" });
      }
      throw err;
    }
  });

  app.delete(api.candidates.delete.path, authenticateToken, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const voteCount = await storage.getCandidateVoteCount(id);
      
      if (voteCount > 0) {
        return res.status(400).json({ 
          message: "No se puede eliminar un candidato que ya tiene votos registrados" 
        });
      }

      await storage.deleteCandidate(id);
      res.json({ message: "Candidato eliminado exitosamente" });
    } catch (err) {
      console.error("[Server] Error deleting candidate:", err);
      res.status(500).json({ message: "Error al eliminar el candidato" });
    }
  });

  app.post(api.votes.submit.path, async (req, res) => {
    try {
      const input = api.votes.submit.input.parse(req.body);
      
      const campaign = await storage.getCampaign(input.campaignId);
      if (!campaign) {
        return res.status(400).json({ message: "Campaña no encontrada" });
      }
      
      if (campaign.status !== 'active') {
         return res.status(400).json({ message: "Esta campaña no está activa" });
      }

      const now = new Date();
      if (now < campaign.startDate || now > campaign.endDate) {
        return res.status(400).json({ message: "La votación está cerrada para esta campaña" });
      }

      const hasVoted = await storage.hasVoted(input.campaignId, input.voterIdentification);
      if (hasVoted) {
        return res.status(400).json({ message: "Ya has votado en esta campaña" });
      }

      const vote = await storage.submitVote(input);
      res.status(201).json(vote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      // Check for unique constraint violation
      if (err instanceof Error && err.message.includes("unique_vote_per_campaign")) {
        return res.status(400).json({ message: "Ya has votado en esta campaña" });
      }
      throw err;
    }
  });

  return httpServer;
}
