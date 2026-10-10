"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Building,
  Home,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Sparkles,
  ShieldCheck,
  Rocket,
  Layers,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { endpoints } from "@/lib/api/endpoints";
import { OnboardingProgressResponse } from "@/types/subscription";
import { BuildingResponse } from "@/types/structure";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export interface FloorConfig {
  floorNumber: number;
  totalFlats: number;
  threeBhkCount: number;
  twoBhkCount: number;
}

const DEFAULT_7_FLOOR_46_FLATS_PRESET: FloorConfig[] = [
  { floorNumber: 1, totalFlats: 7, threeBhkCount: 2, twoBhkCount: 5 },
  { floorNumber: 2, totalFlats: 7, threeBhkCount: 2, twoBhkCount: 5 },
  { floorNumber: 3, totalFlats: 7, threeBhkCount: 2, twoBhkCount: 5 },
  { floorNumber: 4, totalFlats: 7, threeBhkCount: 2, twoBhkCount: 5 },
  { floorNumber: 5, totalFlats: 7, threeBhkCount: 2, twoBhkCount: 5 },
  { floorNumber: 6, totalFlats: 6, threeBhkCount: 2, twoBhkCount: 4 },
  { floorNumber: 7, totalFlats: 5, threeBhkCount: 2, twoBhkCount: 3 },
];

export default function OnboardingWizardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<OnboardingProgressResponse | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  // Step 2 state: Towers
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [towerName, setTowerName] = useState("");
  const [towerCode, setTowerCode] = useState("");
  const [towerFloors, setTowerFloors] = useState<number>(7);
  const [isAddingTower, setIsAddingTower] = useState(false);

  // Step 3 state: Units
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");
  const [unitPrefix, setUnitPrefix] = useState<string>("");
  const [flatsPerFloor, setFlatsPerFloor] = useState<number>(4);
  const [generationTab, setGenerationTab] = useState<"matrix" | "uniform">("matrix");
  const [floorConfigs, setFloorConfigs] = useState<FloorConfig[]>(DEFAULT_7_FLOOR_46_FLATS_PRESET);
  const [isGeneratingUnits, setIsGeneratingUnits] = useState(false);
  const [generatedCount, setGeneratedCount] = useState<number>(0);

  // Final step
  const [isFinalizing, setIsFinalizing] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await endpoints.subscription.getOnboardingProgress();
      setProgress(res);

      if (res.completed) {
        router.replace("/dashboard");
        return;
      }

      // Map backend status to step
      if (res.onboardingStatus === "WIZARD_STEP_1") setCurrentStep(1);
      else if (res.onboardingStatus === "WIZARD_STEP_2") setCurrentStep(2);
      else if (res.onboardingStatus === "WIZARD_STEP_3") setCurrentStep(3);
      else if (res.onboardingStatus === "WIZARD_STEP_4" || res.onboardingStatus === "WIZARD_COMPLETED") setCurrentStep(4);

      // Load buildings
      const blds = await endpoints.structure.getBuildings();
      if (Array.isArray(blds)) {
        setBuildings(blds);
        if (blds.length > 0 && !selectedBuildingId) {
          setSelectedBuildingId(blds[0].id);
        }
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load onboarding status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAdvanceStep = async (nextStep: number) => {
    setError(null);
    let stepCode = "WIZARD_STEP_1";
    if (nextStep === 2) stepCode = "WIZARD_STEP_2";
    if (nextStep === 3) stepCode = "WIZARD_STEP_3";
    if (nextStep === 4) stepCode = "WIZARD_STEP_4";

    try {
      await endpoints.subscription.updateOnboardingStep(stepCode);
      setCurrentStep(nextStep);
    } catch (err: any) {
      setError(err?.message || "Failed to advance step.");
    }
  };

  const handleAddTower = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!towerName.trim()) return;

    setIsAddingTower(true);
    setError(null);

    const code = towerCode.trim() || towerName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 6);

    try {
      await endpoints.structure.createBuilding({
        name: towerName.trim(),
        code: code,
        totalFloors: Number(towerFloors) || 1,
      });

      setTowerName("");
      setTowerCode("");
      setTowerFloors(14);

      // Refresh building list
      const updated = await endpoints.structure.getBuildings();
      setBuildings(updated);
      if (updated.length > 0) {
        setSelectedBuildingId(updated[0].id);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to add building tower.");
    } finally {
      setIsAddingTower(false);
    }
  };

  const apply7FloorPreset = () => {
    setFloorConfigs(DEFAULT_7_FLOOR_46_FLATS_PRESET);
  };

  const updateFloorConfig = (floorNumber: number, field: keyof FloorConfig, value: number) => {
    setFloorConfigs((prev) =>
      prev.map((fc) => {
        if (fc.floorNumber !== floorNumber) return fc;
        const updated = { ...fc, [field]: value };
        if (field === "threeBhkCount") {
          updated.twoBhkCount = Math.max(0, updated.totalFlats - value);
        } else if (field === "totalFlats") {
          updated.threeBhkCount = Math.min(updated.threeBhkCount, value);
          updated.twoBhkCount = Math.max(0, value - updated.threeBhkCount);
        }
        return updated;
      })
    );
  };

  const handleGenerateFloorMatrix = async () => {
    if (!selectedBuildingId) {
      setError("Please select a tower first.");
      return;
    }

    setIsGeneratingUnits(true);
    setError(null);
    let count = 0;

    try {
      for (const fc of floorConfigs) {
        for (let flatIndex = 1; flatIndex <= fc.totalFlats; flatIndex++) {
          const flatSuffix = flatIndex < 10 ? `0${flatIndex}` : `${flatIndex}`;
          const flatNum = `${unitPrefix}${fc.floorNumber}${flatSuffix}`;
          const is3Bhk = flatIndex <= fc.threeBhkCount;
          const config = is3Bhk ? "3BHK" : "2BHK";
          const area = is3Bhk ? 1250.0 : 950.0;

          try {
            await endpoints.structure.createUnit({
              buildingId: selectedBuildingId,
              unitNumber: flatNum,
              floorNumber: fc.floorNumber,
              unitType: "RESIDENTIAL",
              configuration: config,
              areaSqft: area,
            });
            count++;
          } catch {
            // Duplicate ignore if already exists
          }
        }
      }

      setGeneratedCount(count);
      const refreshedProgress = await endpoints.subscription.getOnboardingProgress();
      setProgress(refreshedProgress);
    } catch (err: any) {
      setError(err?.message || "Failed to generate flats.");
    } finally {
      setIsGeneratingUnits(false);
    }
  };

  const handleQuickGenerateUnits = async () => {
    if (!selectedBuildingId) {
      setError("Please select a tower first.");
      return;
    }

    setIsGeneratingUnits(true);
    setError(null);
    let count = 0;

    try {
      const selectedBld = buildings.find((b) => b.id === selectedBuildingId);
      const totalFloors = selectedBld ? (selectedBld as any).totalFloors || 7 : 7;

      for (let floor = 1; floor <= totalFloors; floor++) {
        for (let flatIndex = 1; flatIndex <= flatsPerFloor; flatIndex++) {
          const flatSuffix = flatIndex < 10 ? `0${flatIndex}` : `${flatIndex}`;
          const flatNum = `${unitPrefix}${floor}${flatSuffix}`;
          try {
            await endpoints.structure.createUnit({
              buildingId: selectedBuildingId,
              unitNumber: flatNum,
              floorNumber: floor,
              unitType: "RESIDENTIAL",
              configuration: "2BHK",
              areaSqft: 950.0,
            });
            count++;
          } catch {
            // Duplicate ignore
          }
        }
      }

      setGeneratedCount(count);
      const refreshedProgress = await endpoints.subscription.getOnboardingProgress();
      setProgress(refreshedProgress);
    } catch (err: any) {
      setError(err?.message || "Failed to generate sample units.");
    } finally {
      setIsGeneratingUnits(false);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsFinalizing(true);
    setError(null);

    try {
      await endpoints.subscription.updateOnboardingStep("WIZARD_COMPLETED");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Failed to finalize onboarding.");
      setIsFinalizing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading society setup wizard..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#86f2e4]/30 text-[#006f66] text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Setup Progress: {currentStep} of 4</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#070235]">
          Welcome to {progress?.societyName || "Your Society"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete the guided setup below to configure your towers, units, and launch your administration console.
        </p>
      </div>

      {/* Stepper Tabs */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { step: 1, label: "Identity", icon: Building2 },
          { step: 2, label: "Towers", icon: Building },
          { step: 3, label: "Flats & Units", icon: Home },
          { step: 4, label: "Go Live", icon: Rocket },
        ].map((item) => {
          const Icon = item.icon;
          const isDone = currentStep > item.step;
          const isCurrent = currentStep === item.step;

          return (
            <div
              key={item.step}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                isCurrent
                  ? "border-[#006a61] bg-[#f0fdfa] text-[#006a61] shadow-sm font-bold"
                  : isDone
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                <span className="text-xs hidden sm:inline">Step {item.step}</span>
              </div>
              <span className="text-[11px] sm:text-xs font-semibold">{item.label}</span>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <span className="font-bold">Error:</span>
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Society Details */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#006a61]" />
              <span>Confirm Society Master Identity</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your housing society details as established during account registration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Society Name</span>
              <span className="text-sm font-bold text-[#070235]">{progress?.societyName}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Assigned Tenant Code</span>
              <span className="text-sm font-mono font-bold text-[#006a61]">{progress?.societyCode}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Tenant Verification Status</span>
              <span className="inline-flex items-center gap-1 font-semibold text-amber-700">
                <ShieldCheck className="w-4 h-4" />
                <span>{progress?.verificationStatus || "PENDING_VERIFICATION"}</span>
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block mb-1">Active Administrator</span>
              <span className="font-semibold text-slate-700">Primary Registered Committee Member</span>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => handleAdvanceStep(2)}
              className="px-6 h-10 bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Confirm & Proceed to Towers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Towers & Wings */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#006a61]" />
              <span>Define Buildings, Towers & Wings</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Add the residential towers that make up your complex (e.g. Tower A, Tower B, Wing 1).
            </p>
          </div>

          {/* Add Tower Form */}
          <form onSubmit={handleAddTower} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-[#070235] uppercase tracking-wider">Add New Tower</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tower / Wing Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tower A - Gulmohar"
                  value={towerName}
                  onChange={(e) => setTowerName(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Code (e.g. TWR-A)</label>
                <input
                  type="text"
                  placeholder="e.g. TWR-A"
                  value={towerCode}
                  onChange={(e) => setTowerCode(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Total Floors</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={towerFloors}
                  onChange={(e) => setTowerFloors(Number(e.target.value))}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#006a61]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAddingTower}
                className="px-4 h-8 bg-[#006a61] hover:bg-[#00524b] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingTower ? "Adding..." : "Add Tower"}</span>
              </button>
            </div>
          </form>

          {/* Current Buildings List */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Configured Towers ({buildings.length})</h3>
            {buildings.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No towers added yet. Add at least one tower above.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {buildings.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#070235] block">{b.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">Code: {b.code}</span>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {(b as any).totalFloors || 14} Floors
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-between border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => handleAdvanceStep(3)}
              disabled={buildings.length === 0}
              className="px-6 h-10 bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <span>Proceed to Flats & Units</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Flats & Units */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-[#070235] flex items-center gap-2">
              <Home className="w-5 h-5 text-[#006a61]" />
              <span>Unit & Flat Inventory</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Quick-generate flats or proceed with basic units. You can also upload a full Excel sheet later from the Units tab.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#eaedff]/50 border border-[#c4c1fb]/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#006a61]" />
                <h3 className="text-xs font-bold text-[#070235] uppercase tracking-wider">Building Inventory Builder</h3>
              </div>
              <div className="flex rounded-lg bg-white p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setGenerationTab("matrix")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    generationTab === "matrix" ? "bg-[#070235] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Floor-by-Floor Matrix (Custom 2BHK/3BHK)
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationTab("uniform")}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    generationTab === "uniform" ? "bg-[#070235] text-white" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Uniform Generator
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Tower</label>
                <select
                  value={selectedBuildingId}
                  onChange={(e) => setSelectedBuildingId(e.target.value)}
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Prefix (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. A- or leave empty for 101, 201"
                  value={unitPrefix}
                  onChange={(e) => setUnitPrefix(e.target.value)}
                  className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>
            </div>

            {generationTab === "matrix" ? (
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white border border-teal-200 text-xs">
                  <div>
                    <span className="font-bold text-[#070235] block">Quick Preset: 7 Floors (46 Flats)</span>
                    <span className="text-slate-500 text-[11px]">
                      Floors 1–5: 7 flats (2×3BHK + 5×2BHK) • Floor 6: 6 flats • Floor 7: 5 flats
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={apply7FloorPreset}
                    className="px-3 py-1.5 bg-[#006a61] hover:bg-[#00524b] text-white font-bold text-xs rounded-lg shadow-sm transition-all shrink-0"
                  >
                    Apply 46-Flat Preset
                  </button>
                </div>

                {/* Floor Matrix Table */}
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Floor Level</th>
                        <th className="py-2.5 px-3">Total Flats</th>
                        <th className="py-2.5 px-3 text-[#006a61]">3 BHK Count (1250 sq.ft)</th>
                        <th className="py-2.5 px-3 text-[#070235]">2 BHK Count (950 sq.ft)</th>
                        <th className="py-2.5 px-3 text-right">Sample Units</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {floorConfigs.map((fc) => (
                        <tr key={fc.floorNumber} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-bold text-slate-900">Floor {fc.floorNumber}</td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={fc.totalFlats}
                              onChange={(e) => updateFloorConfig(fc.floorNumber, "totalFlats", Number(e.target.value))}
                              className="w-16 h-7 px-2 border border-slate-200 rounded text-center font-semibold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min={0}
                              max={fc.totalFlats}
                              value={fc.threeBhkCount}
                              onChange={(e) => updateFloorConfig(fc.floorNumber, "threeBhkCount", Number(e.target.value))}
                              className="w-16 h-7 px-2 border border-teal-200 rounded text-center text-[#006a61] font-bold"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <span className="font-semibold text-slate-700 px-2 py-1 bg-slate-100 rounded">
                              {fc.twoBhkCount} flats
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-[11px] font-mono text-slate-500">
                            {unitPrefix}{fc.floorNumber}01 – {unitPrefix}{fc.floorNumber}{fc.totalFlats < 10 ? `0${fc.totalFlats}` : fc.totalFlats}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Calculation Summary */}
                <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-4">
                    <span>
                      Total Flats:{" "}
                      <strong className="text-slate-900">
                        {floorConfigs.reduce((s, f) => s + f.totalFlats, 0)} Units
                      </strong>
                    </span>
                    <span>
                      3 BHK:{" "}
                      <strong className="text-[#006a61]">
                        {floorConfigs.reduce((s, f) => s + f.threeBhkCount, 0)} Units
                      </strong>
                    </span>
                    <span>
                      2 BHK:{" "}
                      <strong className="text-[#070235]">
                        {floorConfigs.reduce((s, f) => s + f.twoBhkCount, 0)} Units
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateFloorMatrix}
                    disabled={isGeneratingUnits || !selectedBuildingId}
                    className="px-5 h-8 bg-[#006a61] hover:bg-[#00524b] text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingUnits ? "animate-spin" : ""}`} />
                    <span>
                      {isGeneratingUnits
                        ? "Creating Flats..."
                        : `Generate All ${floorConfigs.reduce((s, f) => s + f.totalFlats, 0)} Flats`}
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Flats per Floor (Uniform)</label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={flatsPerFloor}
                      onChange={(e) => setFlatsPerFloor(Number(e.target.value))}
                      className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleQuickGenerateUnits}
                    disabled={isGeneratingUnits || !selectedBuildingId}
                    className="px-4 h-8 bg-[#006a61] hover:bg-[#00524b] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingUnits ? "animate-spin" : ""}`} />
                    <span>{isGeneratingUnits ? "Generating..." : "Generate Uniform Flats"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#070235] block">Current Flat Count</span>
              <span className="text-slate-500">Total units registered in database</span>
            </div>
            <span className="text-base font-extrabold text-[#006a61]">
              {progress?.totalUnits || generatedCount} Units
            </span>
          </div>

          <div className="pt-4 flex justify-between border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={() => handleAdvanceStep(4)}
              className="px-6 h-10 bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <span>Proceed to Launch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Go Live */}
      {currentStep === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-[#86f2e4]/30 text-[#006a61] flex items-center justify-center mx-auto">
            <Rocket className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-[#070235]">Setup Complete! Ready to Launch</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Your society workspace has been established with active multi-tenant boundary isolation and your 14-day free trial.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto text-xs py-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Towers</span>
              <span className="font-bold text-[#070235] text-sm">{buildings.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Flats</span>
              <span className="font-bold text-[#070235] text-sm">{progress?.totalUnits || generatedCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block text-[11px]">Plan</span>
              <span className="font-bold text-[#006a61] text-sm">14d Trial</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 h-10 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleCompleteOnboarding}
              disabled={isFinalizing}
              className="px-8 h-10 bg-[#070235] hover:bg-[#1e1b4b] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all disabled:opacity-60"
            >
              <span>{isFinalizing ? "Launching Console..." : "Complete Setup & Launch Dashboard"}</span>
              <Rocket className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
