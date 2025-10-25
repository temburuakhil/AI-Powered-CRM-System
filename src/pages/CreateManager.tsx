import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Briefcase } from "lucide-react";

const CreateManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [managerName, setManagerName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateManager = () => {
    if (!managerName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a manager name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    // Get existing managers from localStorage
    const existingManagers = JSON.parse(localStorage.getItem("customManagers") || "[]");

    // Create new manager object
    const newManager = {
      id: Date.now().toString(),
      name: managerName.trim(),
      createdAt: new Date().toISOString(),
      projects: [],
    };

    // Add to managers list
    const updatedManagers = [...existingManagers, newManager];
    localStorage.setItem("customManagers", JSON.stringify(updatedManagers));

    toast({
      title: "Success!",
      description: `${managerName} manager created successfully`,
    });

    setTimeout(() => {
      setIsCreating(false);
      navigate("/");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-8 py-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-600 blur-md opacity-40 -z-10"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
                Create New Manager Profile
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Add a new service manager to your admin portal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <Card className="p-8 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-2 border-slate-200/60 dark:border-slate-800/60 shadow-xl">
          <div className="space-y-8">
            {/* Icon Preview */}
            <div className="flex justify-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                  <Briefcase className="w-12 h-12 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-600 blur-xl opacity-40 -z-10"></div>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Manager / Service Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Healthcare, Education, Transportation..."
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  className="text-lg py-6 border-2 border-slate-300 dark:border-slate-700 focus:border-indigo-500"
                  disabled={isCreating}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  This will appear as a card in your admin portal
                </p>
              </div>
            </div>

            {/* Preview */}
            {managerName && (
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Preview
                </label>
                <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <Briefcase className="w-7 h-7 text-white" />
                      </div>
                      <div className="w-3 h-3 rounded-full bg-white/60 animate-pulse"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">{managerName}</h2>
                    <p className="text-white/80 text-sm">Custom Manager Profile</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-6">
              <Button
                onClick={handleCreateManager}
                disabled={!managerName.trim() || isCreating}
                className="flex-1 py-6 text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-lg shadow-indigo-500/30"
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Manager Profile
                  </>
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="px-8 py-6 text-lg border-2"
                disabled={isCreating}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreateManager;
