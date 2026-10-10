import React, { useState, useRef } from 'react';
import { Project, Task } from '../../types';
import {
  exportDataToJson,
  validateBackupJson,
  getStorageUsageInfo,
} from '../../services/storage';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Download,
  Upload,
  Trash2,
  RefreshCw,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';

interface SettingsViewProps {
  projects: Project[];
  tasks: Task[];
  onLoadSampleData: () => void;
  onImportData: (importedProjects: Project[], importedTasks: Task[]) => void;
  onClearAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  projects,
  tasks,
  onLoadSampleData,
  onImportData,
  onClearAllData,
}) => {
  const [showClearModal, setShowClearModal] = useState(false);
  const [showSampleDataModal, setShowSampleDataModal] = useState(false);
  const [importPendingData, setImportPendingData] = useState<{
    projects: Project[];
    tasks: Task[];
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const storageInfo = getStorageUsageInfo();

  // Export
  const handleExport = () => {
    exportDataToJson(projects, tasks);
  };

  // Handle File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = validateBackupJson(content);

      if (!validation.valid) {
        setImportError(validation.error || 'Failed to parse backup JSON file.');
      } else {
        setImportPendingData({
          projects: validation.projects,
          tasks: validation.tasks,
        });
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read the selected file.');
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (importPendingData) {
      onImportData(importPendingData.projects, importPendingData.tasks);
      setImportPendingData(null);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#F3F4F6]">
      {/* Header */}
      <div className="pb-3 border-b border-[#27292E]">
        <h1 className="text-xl font-bold text-[#F3F4F6] tracking-tight">Settings & Storage</h1>
        <p className="text-xs text-[#9CA3AF] mt-0.5">
          Manage local data, perform full JSON backups, and configure workspace data.
        </p>
      </div>

      {/* Storage Information Banner */}
      <div className="bg-[#151619] border border-[#27292E] rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1D1F23] border border-[#27292E] text-[#818CF8] flex items-center justify-center shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-[#F3F4F6]">Browser Local Storage</h2>
            <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
              TaskFlow operates entirely on client-side browser storage (HTML5 LocalStorage).
              Your data is completely private, stored on this device, and never uploaded to any remote server or AI system.
            </p>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#27292E] text-xs">
          <div className="p-3 bg-[#0A0A0B] border border-[#27292E] rounded-lg">
            <span className="text-[#6B7280] block text-[11px] mb-0.5">Total Projects</span>
            <span className="text-base font-bold font-mono text-[#F3F4F6] tabular-nums">
              {projects.length}
            </span>
          </div>
          <div className="p-3 bg-[#0A0A0B] border border-[#27292E] rounded-lg">
            <span className="text-[#6B7280] block text-[11px] mb-0.5">Total Tasks</span>
            <span className="text-base font-bold font-mono text-[#F3F4F6] tabular-nums">
              {tasks.length}
            </span>
          </div>
          <div className="p-3 bg-[#0A0A0B] border border-[#27292E] rounded-lg">
            <span className="text-[#6B7280] block text-[11px] mb-0.5">Storage Footprint</span>
            <span className="text-base font-bold font-mono text-[#F3F4F6] tabular-nums">
              {storageInfo.formatted}
            </span>
          </div>
        </div>
      </div>

      {/* Backup and Restore Section */}
      <div className="bg-[#151619] border border-[#27292E] rounded-xl p-5 space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F6]">Backup & Restore</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Safely download backups as standardized JSON files or restore a previous snapshot.
          </p>
        </div>

        {importError && (
          <div className="p-3 rounded-lg bg-[#F87171]/10 border border-[#F87171]/25 text-[#F87171] text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] border border-[#27292E] hover:bg-[#27292E] rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Export Backup (JSON)</span>
          </button>

          {/* Import File Button */}
          <input
            type="file"
            ref={fileInputRef}
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 text-xs font-medium text-[#F3F4F6] bg-[#1D1F23] border border-[#27292E] hover:bg-[#27292E] rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span>Import Backup (JSON)</span>
          </button>
        </div>
      </div>

      {/* Workspace Maintenance */}
      <div className="bg-[#151619] border border-[#27292E] rounded-xl p-5 space-y-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-[#F3F4F6]">Workspace Maintenance</h2>
          <p className="text-xs text-[#9CA3AF] mt-0.5">
            Reset to starter demo data or wipe all stored local items.
          </p>
        </div>

        <div className="divide-y divide-[#27292E]">
          {/* Load Demo Data */}
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#F3F4F6]">Load Starter Sample Data</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Populates realistic personal and engineering projects with sample deadlines and tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSampleDataModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#818CF8] bg-[#818CF8]/10 hover:bg-[#818CF8]/20 border border-[#818CF8]/30 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Load Sample Data</span>
            </button>
          </div>

          {/* Clear All Data */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#F87171]">Clear All Workspace Data</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Permanently wipes all tasks, projects, and custom entries from your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F87171] bg-[#F87171]/10 hover:bg-[#F87171]/20 border border-[#F87171]/30 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Everything</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Clearing All Data */}
      <ConfirmModal
        isOpen={showClearModal}
        title="Clear All Workspace Data?"
        message="This action will permanently delete all your projects, tasks, and history from browser local storage. We strongly recommend exporting a JSON backup before proceeding."
        confirmLabel="Yes, Clear Everything"
        cancelLabel="Keep Data"
        isDestructive={true}
        onConfirm={() => {
          setShowClearModal(false);
          onClearAllData();
        }}
        onCancel={() => setShowClearModal(false)}
      />

      {/* Confirmation Modal for Loading Sample Data */}
      <ConfirmModal
        isOpen={showSampleDataModal}
        title="Reset & Load Sample Data?"
        message="Loading sample data will replace your current workspace items with curated personal and technical demo projects. Are you sure you want to proceed?"
        confirmLabel="Load Demo Data"
        cancelLabel="Cancel"
        isDestructive={false}
        onConfirm={() => {
          setShowSampleDataModal(false);
          onLoadSampleData();
        }}
        onCancel={() => setShowSampleDataModal(false)}
      />

      {/* Confirmation Modal for Importing JSON Backup */}
      {importPendingData && (
        <ConfirmModal
          isOpen={true}
          title="Restore Backup Data?"
          message={`The backup contains ${importPendingData.projects.length} projects and ${importPendingData.tasks.length} tasks. Confirming will replace your current workspace data.`}
          confirmLabel="Restore and Replace"
          cancelLabel="Cancel"
          isDestructive={true}
          onConfirm={handleConfirmImport}
          onCancel={() => setImportPendingData(null)}
        />
      )}
    </div>
  );
};
