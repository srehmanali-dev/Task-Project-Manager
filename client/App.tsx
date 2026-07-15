import { Outlet } from "react-router";
import { App as AppProvider } from "@superblocksteam/library";
import { Toaster } from "./components/common/sonner";
import { AuthProvider } from "./context/AuthContext";
import AppSidebar from "./components/layout/AppSidebar";

export default function AppComponent() {
  return (
    <>
      {/* Do not remove the AppProvider */}
      <AppProvider className="h-full w-full">
        <AuthProvider>
          <div className="flex h-screen w-screen overflow-hidden">
            <AppSidebar />
            <main className="flex-1 p-6 overflow-auto">
              <Outlet />
            </main>
          </div>
        </AuthProvider>
      </AppProvider>
      <Toaster />
    </>
  );
}
