import "dotenv/config";
import { storage } from "../server/storage";
import { hashPassword } from "../server/auth";

async function seed() {
  const username = "admin";
  const password = "admin_password_123";
  
  const existing = await storage.getUserByUsername(username);
  if (existing) {
    console.log("El usuario admin ya existe.");
    process.exit(0);
  }

  const hashedPassword = await hashPassword(password);
  await storage.createUser({
    username,
    password: hashedPassword,
  });

  console.log(`Usuario administrador creado con éxito:`);
  console.log(`Usuario: ${username}`);
  console.log(`Contraseña: ${password}`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Error al crear el usuario admin:", err);
  process.exit(1);
});
