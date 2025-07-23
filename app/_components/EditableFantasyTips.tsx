"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ArrowUpCircle, ArrowDownCircle, Edit, Save, X } from "lucide-react";
import axios from "axios";
import { useI18n } from "@/lib/hooks/useI18n";

interface Player {
  name: string;
  team: string;
  reason: string;
}

interface FantasyTipsState {
  recommended: Player[];
  notRecommended: Player[];
}

// Initial data as fallback
const initialTips: FantasyTipsState = {
  recommended: [
    { name: "Lautaro Martinez", team: "Inter", reason: "In forma eccezionale" },
    { name: "Kvaratskhelia", team: "Napoli", reason: "Tante occasioni create" },
    {
      name: "Gudmundsson",
      team: "Genoa",
      reason: "Ottimo rapporto qualità/prezzo",
    },
  ],
  notRecommended: [
    { name: "Immobile", team: "Lazio", reason: "Momento difficile" },
    { name: "Lookman", team: "Atalanta", reason: "Rendimento in calo" },
    { name: "Giroud", team: "Milan", reason: "Turnover frequente" },
  ],
};

export default function EditableFantasyTips() {
  const [tips, setTips] = useState<FantasyTipsState>(initialTips);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTips, setEditedTips] = useState<FantasyTipsState>(initialTips);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useI18n();

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchTips = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("/api/fantasy-tips");

      if (
        response.data &&
        response.data.recommended &&
        response.data.notRecommended
      ) {
        setTips({
          recommended: response.data.recommended,
          notRecommended: response.data.notRecommended,
        });
        setEditedTips({
          recommended: response.data.recommended,
          notRecommended: response.data.notRecommended,
        });
      }
    } catch (err) {
      console.error("Error fetching fantasy tips:", err);
      setError(t('fantasy.error'));
      // Use initial data as fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tips from API on component mount
  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  // Memoized save function
  const saveTips = useCallback(async () => {
    try {
      setIsSaving(true);
      const response = await axios.post("/api/fantasy-tips", editedTips);

      if (response.data) {
        setTips({
          recommended: response.data.recommended,
          notRecommended: response.data.notRecommended,
        });
        setIsEditing(false);
        setError(null);
      }
    } catch (err) {
      console.error("Error saving fantasy tips:", err);
      setError("Impossibile salvare i consigli. Riprova più tardi.");
    } finally {
      setIsSaving(false);
    }
  }, [editedTips]);

  // Memoized cancel function
  const cancelEditing = useCallback(() => {
    setEditedTips(tips);
    setIsEditing(false);
  }, [tips]);

  // Memoized input change handler
  const handlePlayerChange = useCallback((
    listType: "recommended" | "notRecommended",
    index: number,
    field: keyof Player,
    value: string
  ) => {
    setEditedTips((prev) => {
      const newList = [...prev[listType]];
      newList[index] = { ...newList[index], [field]: value };
      return { ...prev, [listType]: newList };
    });
  }, []);

  // Memoized add player function
  const addPlayer = useCallback((listType: "recommended" | "notRecommended") => {
    setEditedTips((prev) => ({
      ...prev,
      [listType]: [...prev[listType], { name: "", team: "", reason: "" }],
    }));
  }, []);

  // Memoized remove player function
  const removePlayer = useCallback((
    listType: "recommended" | "notRecommended",
    index: number
  ) => {
    setEditedTips((prev) => ({
      ...prev,
      [listType]: prev[listType].filter((_, i) => i !== index),
    }));
  }, []);

  // Memoized loading skeleton
  const loadingSkeleton = useMemo(() => (
    <div className="space-y-4 animate-pulse">
      <div className="h-40 bg-gray-100 rounded-lg"></div>
      <div className="h-40 bg-gray-100 rounded-lg"></div>
    </div>
  ), []);

  if (isLoading) {
    return loadingSkeleton;
  }

  return (
    <div className="space-y-4 text-black">
      {error && (
        <div className="p-3 text-sm text-amber-800 bg-amber-50 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">{t('fantasy.title')}</h3>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={saveTips}
              disabled={isSaving}
              className={`p-1.5 text-xs flex items-center gap-1 ${
                isSaving
                  ? "bg-gray-100 text-gray-400"
                  : "bg-green-100 text-green-800 hover:bg-green-200"
              } rounded-md transition-colors`}
            >
              <Save size={14} />
              <span>{isSaving ? t('fantasy.saving') : t('fantasy.save')}</span>
            </button>
            <button
              onClick={cancelEditing}
              disabled={isSaving}
              className="p-1.5 text-xs flex items-center gap-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
            >
              <X size={14} />
              <span>{t('fantasy.cancel')}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-xs flex items-center gap-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Edit size={14} />
            <span>{t('fantasy.edit')}</span>
          </button>
        )}
      </div>

      {/* Recommended Players */}
      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
        <h3 className="font-semibold mb-2 flex items-center">
          <ArrowUpCircle size={16} className="text-green-600 mr-1" />
          Giocatori da Acquistare
        </h3>
        {isEditing ? (
          <div className="space-y-2">
            {editedTips.recommended.map((player, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      handlePlayerChange(
                        "recommended",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Nome"
                    className="p-1.5 text-sm border border-gray-300 rounded col-span-2"
                  />
                  <input
                    type="text"
                    value={player.team}
                    onChange={(e) =>
                      handlePlayerChange(
                        "recommended",
                        index,
                        "team",
                        e.target.value
                      )
                    }
                    placeholder="Squadra"
                    className="p-1.5 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={player.reason}
                    onChange={(e) =>
                      handlePlayerChange(
                        "recommended",
                        index,
                        "reason",
                        e.target.value
                      )
                    }
                    placeholder="Motivo"
                    className="p-1.5 text-sm border border-gray-300 rounded col-span-2"
                  />
                </div>
                <button
                  onClick={() => removePlayer("recommended", index)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addPlayer("recommended")}
              className="mt-2 w-full p-1.5 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
            >
              + Aggiungi Giocatore
            </button>
          </div>
        ) : (
          <ul className="list-none space-y-1">
            {tips.recommended.map((player, index) => (
              <li key={index} className="flex items-start">
                <ArrowUpCircle
                  size={16}
                  className="text-green-600 mr-1.5 mt-0.5 flex-shrink-0"
                />
                <span>
                  <strong>{player.name}</strong> ({player.team}) -{" "}
                  {player.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Not Recommended Players */}
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <h3 className="font-semibold mb-2 flex items-center">
          <ArrowDownCircle size={16} className="text-red-600 mr-1" />
          Giocatori da Evitare
        </h3>
        {isEditing ? (
          <div className="space-y-2">
            {editedTips.notRecommended.map((player, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) =>
                      handlePlayerChange(
                        "notRecommended",
                        index,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Nome"
                    className="p-1.5 text-sm border border-gray-300 rounded col-span-2"
                  />
                  <input
                    type="text"
                    value={player.team}
                    onChange={(e) =>
                      handlePlayerChange(
                        "notRecommended",
                        index,
                        "team",
                        e.target.value
                      )
                    }
                    placeholder="Squadra"
                    className="p-1.5 text-sm border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={player.reason}
                    onChange={(e) =>
                      handlePlayerChange(
                        "notRecommended",
                        index,
                        "reason",
                        e.target.value
                      )
                    }
                    placeholder="Motivo"
                    className="p-1.5 text-sm border border-gray-300 rounded col-span-2"
                  />
                </div>
                <button
                  onClick={() => removePlayer("notRecommended", index)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => addPlayer("notRecommended")}
              className="mt-2 w-full p-1.5 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
            >
              + Aggiungi Giocatore
            </button>
          </div>
        ) : (
          <ul className="list-none space-y-1">
            {tips.notRecommended.map((player, index) => (
              <li key={index} className="flex items-start">
                <ArrowDownCircle
                  size={16}
                  className="text-red-600 mr-1.5 mt-0.5 flex-shrink-0"
                />
                <span>
                  <strong>{player.name}</strong> ({player.team}) -{" "}
                  {player.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
