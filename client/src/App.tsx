import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "./pages/home";
import AdminDashboard from "./pages/admin/dashboard";
import CreateCampaign from "./pages/admin/create-campaign";
import ManageCampaign from "./pages/admin/manage-campaign";
import AdminLogin from "./pages/admin/login";
import VotingBooth from "./pages/vote/voting-booth";
import NotFound from "./pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/campaigns/new" component={CreateCampaign} />
      <Route path="/admin/campaigns/:id" component={ManageCampaign} />
      
      {/* Public Voting Routes */}
      <Route path="/vote/:uniqueLink" component={VotingBooth} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
