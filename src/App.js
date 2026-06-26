/**
  ---------------------------------------------
  Modification History:
    [2025.05.13] Mod: NVR Firmware Version list 

  ---------------------------------------------
*/

import React, { useState, useMemo, useEffect } from 'react';
import { 
  PlusCircle, 
  Trash2, 
  Settings, 
  Video, 
  Cpu,
  AlertTriangle,
  CheckCircle2,
  Lock
} from 'lucide-react';

const NVR_MODELS = [
    { model: "DR-8564 / 8564D", versions: [{ label: "v9.2.0 or Higher", units: 64 },{ label: "v9.1.0 ", units: 32 }, { label: "Below v9.0.0", units: 64 }] },
    { model: "DR-8532 / 8532D", versions: [{ label: "v9.2.0 or Higher", units: 32 },{ label: "v9.1.0 ", units: 16 }, { label: "Below v9.0.0", units: 32 }] },
    { model: "DR-8516", versions: [{ label: "v9.2.0 or Higher", units: 16 },{ label: "v9.1.0", units: 16 }, { label: "Below v9.0.0", units: 16 }] },
    { model: "DR-6532P / -A", versions: [{ label: "v9.2.0 or Higher", units: 32 },{ label: "v9.1.0", units: 16 }, { label: "Below v9.0.0", units: 32 }] },
    { model: "DR-6516P / -A", versions: [{ label: "v9.2.0 or Higher", units: 16 },{ label: "v9.1.0", units: 16 }, { label: "Below v9.0.0", units: 16 }] },
    { model: "DR-6508P", versions: [{ label: "v9.2.0 or Higher", units: 8 },{ label: "v9.1.0", units: 16 }, { label: "Below v9.0.0", units: 8 }] },
    { model: "DR-3516P ", versions: [{ label: "v9.1.0", units: 8 }, { label: "Below v9.0.0", units: 16 }] },
    { model: "DR-M216P", versions: [{ label: "v9.0.0 or 9.1.0", units: 16 }]},
    // Start Mod: NVR Firmware Version list 
    { model: "DR-2516P / -A", versions: [{ label: "v9.1.0", units: 8 }, { label: "Below v9.0.0", units: 16 }] },
    { model: "DR-2508P / -A", versions: [{ label: "v9.1.0", units: 8 }, { label: "Below v9.0.0", units: 8 }] },
    { model: "DR-2504P / -A / -B / -C ", versions: [{ label: "v9.1.0", units: 8 }, { label: "Below v9.0.0", units: 4 }] }
    // End Mod: NVR Firmware Version list 
];

const VA_FEATURES = [
    { id: 'obj', label: 'Object Detection', group: 'ENGINE_1', icon: '🎯' },
    { id: 'intrusion', label: 'Intrusion Detection', group: 'ENGINE_1', icon: '🚧' },
    { id: 'loitering', label: 'Loitering Detection', group: 'ENGINE_1', icon: '⏳' },
    { id: 'line', label: 'Line Crossing', group: 'ENGINE_1', icon: '➖' },
    { id: 'face', label: 'Face Detection', group: 'ENGINE_2', icon: '👤' },
    { id: 'abandoned', label: 'Abandoned Object', group: 'ENGINE_3', icon: '📦' },
    { id: 'removed', label: 'Removed Object', group: 'ENGINE_3', icon: '💨' },
    { id: 'fall', label: 'Fall Detection', group: 'ENGINE_4', icon: '⚠️' },
    { id: 'crowd', label: 'Crowd Detection', group: 'ENGINE_5', icon: '👨‍👩‍👦' },
    { id: 'acut_obj', label: 'Attribute (Object)', group: 'ENGINE_6', icon: '🔍', dependsOn: 'ENGINE_1' },
    { id: 'acut_face', label: 'Attribute (Face)', group: 'ENGINE_7', icon: '🆔', dependsOn: 'ENGINE_2' },
    { id: 'Counting', label: 'People Counting', group: 'ENGINE_0', icon: '🔢' },
    { id: 'Queue', label: 'Queue Management', group: 'ENGINE_0', icon: '👥' },
    { id: 'Heatmap', label: 'Heatmap ', group: 'ENGINE_0', icon: '🔥' },
    { id: 'SocialDist', label: 'Social Distancing Violation', group: 'ENGINE_0', icon: '📏' },
    { id: 'MaskRule', label: 'Mask Rule Violation', group: 'ENGINE_0', icon: '😷' }
];

const CAMERA_TYPES = {
    'idla_standard': { label: 'IDLA IP-C', allowedGroups: ['ENGINE_1', 'ENGINE_2'], maxConcurrentEngines: 2 },
    'idla_pro': { label: 'IDLA Pro IP-C', allowedGroups: ['ENGINE_1', 'ENGINE_2', 'ENGINE_3', 'ENGINE_4', 'ENGINE_5', 'ENGINE_6', 'ENGINE_7'], maxConcurrentEngines: 7, minFw: "v9.1.0+" },
    'dv1304': { label: 'DV-1304 1CH', allowedGroups: ['ENGINE_0'], maxConcurrentEngines: 0, limitOneFeature: true  },
    'dv1304a': { label: 'DV-1304-A 1CH', allowedGroups: ['ENGINE_1', 'ENGINE_2'], maxConcurrentEngines: 1, limitOneFeature: true }
};

const ENGINE_LABELS = {
  'ENGINE_0': 'BI',
  'ENGINE_1': 'Object Engine',
  'ENGINE_2': 'Face Engine ',
  'ENGINE_3': 'Abadoned Detection Engine',
  'ENGINE_4': 'Fall Detection Engine',
  'ENGINE_5': 'Crowd Detection Engine',
  'ENGINE_6': 'Attribute(Object)',
  'ENGINE_7': 'Attribute(Face)'
};

// [추가] v9.2.0에서 성능을 차지하지 않을 엔진 목록 지정
const FREE_ENGINES_V920 = ['ENGINE_3', 'ENGINE_4'];

export default function App() {
    const [selectedModelIdx, setSelectedModelIdx] = useState(0);
    const [selectedVerIdx, setSelectedVerIdx] = useState(0); 
    const [cameraGroups, setCameraGroups] = useState([
        { id: 1, name: "CH Group 1", typeId: 'idla_standard', selectedFeatureIds: [], quantity: 1 }
    ]);
    const [hoveredFeature, setHoveredFeature] = useState(null);

    const currentNVR = NVR_MODELS[selectedModelIdx].versions[selectedVerIdx];
    const isOldFirmware = currentNVR.label === "Below v9.0.0" || currentNVR.label === "v9.0.0 or 9.1.0";
    
    // [추가] 현재 선택된 펌웨어가 v9.2.0 이상인지 체크
    const isV920OrHigher = currentNVR.label.includes("v9.2.0");

    useEffect(() => {
        if (isOldFirmware) {
            setCameraGroups(prev => prev.map(g => 
                g.typeId === 'idla_pro' ? { ...g, typeId: 'idla_standard', selectedFeatureIds: [] } : g
            ));
        }
    }, [isOldFirmware]);

    // [수정] calculateUsage에 v9.2.0 체크 로직 반영
    const calculateUsage = (group) => {
        const activeEngineGroups = new Set(); // 전체 구동되는 엔진 (동시 엔진 갯수 제한용)
        const costEngineGroups = new Set();   // 실제 Throughput 비용을 차지하는 엔진

        group.selectedFeatureIds.forEach(id => {
            const feat = VA_FEATURES.find(f => f.id === id);
            if (feat && feat.group !== 'ENGINE_0') {
                activeEngineGroups.add(feat.group);
                
                // v9.2.0 이상이고, 무료 엔진 목록에 포함된 경우 비용(units) 계산에서 제외
                if (isV920OrHigher && FREE_ENGINES_V920.includes(feat.group)) {
                    // Do nothing for cost
                } else {
                    costEngineGroups.add(feat.group);
                }
            }
        });
        
        return { 
            units: costEngineGroups.size * group.quantity, 
            enginesCount: activeEngineGroups.size 
        };
    };

    // [수정] useMemo 의존성 배열에 isV920OrHigher 추가
    const totals = useMemo(() => {
        return cameraGroups.reduce((acc, g) => {
            const usage = calculateUsage(g);
            acc.units += usage.units;
            return acc;
        }, { units: 0 });
    }, [cameraGroups, isV920OrHigher]);

    const usagePercent = Math.round((totals.units / currentNVR.units) * 100);
    const isOverloaded = totals.units > currentNVR.units;

    const addGroup = () => {
        setCameraGroups([...cameraGroups, { 
            id: Date.now(), 
            name: `CH Group ${cameraGroups.length + 1}`, 
            typeId: 'idla_standard', 
            selectedFeatureIds: [], 
            quantity: 1 
        }]);
    };

    const updateGroup = (id, field, value) => {
        setCameraGroups(cameraGroups.map(g => (g.id === id ? { ...g, [field]: value, selectedFeatureIds: field === 'typeId' ? [] : g.selectedFeatureIds } : g)));
    };

    const toggleFeature = (groupId, featureId) => {
        setCameraGroups(cameraGroups.map(g => {
            if (g.id !== groupId) return g;
            const config = CAMERA_TYPES[g.typeId];
            const isSelected = g.selectedFeatureIds.includes(featureId);
            let next = [...g.selectedFeatureIds];

            if (isSelected) {
                next = next.filter(id => id !== featureId);
                const removedFeat = VA_FEATURES.find(f => f.id === featureId);
                
                if (removedFeat.group === 'ENGINE_1') {
                    const stillHasEngine1 = next.some(id => {
                        const f = VA_FEATURES.find(v => v.id === id);
                        return f && f.group === 'ENGINE_1';
                    });

                    if (!stillHasEngine1) {
                        next = next.filter(id => {
                            const f = VA_FEATURES.find(v => v.id === id);
                            return f?.dependsOn !== 'ENGINE_1';
                        });
                    }
                }

                if (removedFeat.group === 'ENGINE_2') next = next.filter(id => VA_FEATURES.find(f => f.id === id).dependsOn !== 'ENGINE_2');
            } else {
                if (config.limitOneFeature) {
                    next = [featureId];
                } else {
                    const featToEnable = VA_FEATURES.find(f => f.id === featureId);
                    if (featToEnable.dependsOn) {
                        const hasDependency = g.selectedFeatureIds.some(id => VA_FEATURES.find(f => f.id === id).group === featToEnable.dependsOn);
                        if (!hasDependency) return g; 
                    }

                    next.push(featureId);
                    const tempEngines = new Set();
                    next.forEach(id => {
                        const f = VA_FEATURES.find(x => x.id === id);
                        if (f && f.group !== 'ENGINE_0') tempEngines.add(f.group);
                    });
                    if (tempEngines.size > config.maxConcurrentEngines && config.maxConcurrentEngines > 0) return g; 
                }
            }
            return { ...g, selectedFeatureIds: next };
        }));
    };

    const renderFeatureBtn = (feat, group) => {
        const isSelected = group.selectedFeatureIds.includes(feat.id);
        const config = CAMERA_TYPES[group.typeId];
        let isLocked = false;
        let lockReason = "";
        
        if (feat.dependsOn && !config.limitOneFeature) {
            const hasDependency = group.selectedFeatureIds.some(id => {
              const f = VA_FEATURES.find(v => v.id === id);
              return f && f.group === feat.dependsOn;
            });

            if (!hasDependency) {
                isLocked = true;
                lockReason = feat.dependsOn === 'ENGINE_1' 
                  ? 'Object Detection 엔진 선택 필요' 
                  : 'Face Detection 엔진 선택 필요';
            }
        }

        const isHovered = hoveredFeature?.id === feat.id && hoveredFeature?.groupId === group.id;

        return (
            <div className="relative group/btn" key={feat.id}>
                <button 
                    onMouseEnter={() => setHoveredFeature({ id: feat.id, groupId: group.id })}
                    onMouseLeave={() => setHoveredFeature(null)}
                    onClick={() => !isLocked && toggleFeature(group.id, feat.id)}
                    disabled={isLocked}
                    className={`p-1 rounded-lg border flex flex-col items-center justify-center gap-0.5 transition-all w-[68px] h-[50px] relative overflow-visible
                        ${isSelected ? 'border-[#0099B0] bg-[#eaf7ff] text-[#0099B0] shadow-sm z-10 ring-1 ring-[#0099B0]/20' : 
                          isLocked ? 'border-slate-100 bg-slate-50/50 cursor-not-allowed' : 
                          'border-slate-100 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600'}`}>

                    {isLocked ? (
                        <Lock className="w-3 h-3 text-slate-300 opacity-60 mb-0.5" />
                    ) : (
                        <span className={`text-base leading-none ${isSelected ? '' : 'grayscale opacity-50 group-hover/btn:opacity-100 group-hover/btn:grayscale-0 transition-all'}`}>
                            {feat.icon}
                        </span>
                    )}

                    <span className={`text-[7px] font-black text-center truncate w-full uppercase leading-tight ${isLocked ? 'text-slate-300' : ''}`}>
                        {feat.label.split(' ')[0]}
                    </span>
                </button>

                {isHovered && (
                    <div className="absolute z-[60] bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none">
                        <div className={`text-white text-[10px] font-bold py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap relative animate-in fade-in zoom-in duration-150
                            ${isLocked ? 'bg-red-500 ring-2 ring-red-200' : 'bg-slate-800'}`}>
                            {isLocked ? lockReason : feat.label}
                            <div className={`absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent 
                                ${isLocked ? 'border-t-red-500' : 'border-t-slate-800'}`}></div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isOverloaded ? 'bg-red-50' : 'bg-slate-50/50'}`}>
            <header className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-500 border-b
                ${isOverloaded ? 'bg-white/95 border-red-200 shadow-red-100 shadow-lg' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
              <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shadow-inner flex items-center justify-center transition-colors
                      ${isOverloaded ? 'bg-red-500 text-white animate-pulse' : 'bg-[#0099B0] text-white'}`}>
                      {isOverloaded ? <AlertTriangle className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                  </div>
                  <div>
                    <h1 className={`text-lg font-black tracking-tight leading-none ${isOverloaded ? 'text-red-600' : 'text-slate-900'}`}>
                        NVR VA Resource Calculator
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{NVR_MODELS[selectedModelIdx].model}</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-[10px] font-bold text-[#0099B0] uppercase">{currentNVR.label}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 flex-1 justify-end max-w-2xl w-full">
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between items-end mb-1 px-1">
                      <span className={`text-[9px] font-black uppercase tracking-tighter ${isOverloaded ? 'text-red-500' : 'text-slate-400'}`}>
                        {isOverloaded ? 'CRITICAL OVERLOAD' : 'System Resource'}
                      </span>
                      <span className={`text-xs font-black tabular-nums ${isOverloaded ? 'text-red-600' : 'text-[#0099B0]'}`}>
                        {totals.units} / {currentNVR.units} <span className="text-[10px] text-slate-400">Throughput</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/50 relative">
                        <div className={`h-full rounded-full transition-all duration-700 ease-out 
                            ${isOverloaded ? 'bg-red-500' : 'bg-[#0099B0]'}`}
                             style={{ width: `${Math.min((totals.units / currentNVR.units) * 100, 100)}%` }} />
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1.5 rounded-xl flex items-center gap-2 border ${isOverloaded ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                    <div className={`text-lg font-black tabular-nums leading-none ${isOverloaded ? 'text-red-600' : 'text-emerald-600'}`}>
                        {usagePercent}%
                    </div>
                    {isOverloaded ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
              </div>
            </header>

            <div className="max-w-6xl mx-auto p-4 md:p-6">
                <div className="grid grid-cols-12 gap-6">
                    <aside className="col-span-12 lg:col-span-3 space-y-4">
                        <section className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 mb-5 border-b border-slate-50 pb-3">
                                <Settings className="w-4 h-4 text-slate-400" />
                                <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-nowrap">NVR Selection</h2>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 px-1 uppercase tracking-wider">NVR Model</label>
                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none hover:border-[#0099B0] transition-colors"
                                        value={selectedModelIdx} onChange={e => { setSelectedModelIdx(Number(e.target.value))}}>
                                        {NVR_MODELS.map((m, idx) => <option key={idx} value={idx}>{m.model}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-bold text-slate-400 px-1 uppercase tracking-wider">Firmware Version</label>
                                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none hover:border-[#0099B0] transition-colors"
                                        value={selectedVerIdx} onChange={e => setSelectedVerIdx(Number(e.target.value))}>
                                        {NVR_MODELS[selectedModelIdx].versions.map((v, idx) => <option key={idx} value={idx}>{v.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </section>
                        <button onClick={addGroup} className="w-full py-3.5 bg-[#0099B0] hover:bg-[#0099B0] text-white rounded-2xl font-black text-xs shadow-lg shadow-[#c6efff] transition-all flex items-center justify-center gap-2 active:scale-95 group">
                            <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Add Camera Group
                        </button>
                    </aside>

                    <main className="col-span-12 lg:col-span-9 space-y-4">
                        {cameraGroups.map(group => {
                            const usage = calculateUsage(group);
                            const config = CAMERA_TYPES[group.typeId];
                            
                            const groupedFeatures = VA_FEATURES.reduce((acc, feat) => {
                              if (config.allowedGroups.includes(feat.group)) {
                                if (!acc[feat.group]) acc[feat.group] = [];
                                acc[feat.group].push(feat);
                              }
                              return acc;
                            }, {});

                            const row1Keys = ['ENGINE_1', 'ENGINE_2'];
                            const row2Keys = ['ENGINE_3', 'ENGINE_4', 'ENGINE_5', 'ENGINE_6', 'ENGINE_7'];
                            const biKeys = ['ENGINE_0'];

                            return (
                                <article key={group.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="w-full md:w-52 bg-slate-50/50 p-4 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between shrink-0">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <Video className="w-4 h-4 text-[#0099B0]" />
                                                <input type="text" value={group.name} onChange={e => updateGroup(group.id, 'name', e.target.value)}
                                                    className="bg-transparent font-black text-sm text-slate-800 outline-none w-full border-b border-transparent focus:border-[#0099B0]" />
                                            </div>
                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Device Type</span>
                                                    <select value={group.typeId} onChange={e => updateGroup(group.id, 'typeId', e.target.value)}
                                                        className="w-full bg-white px-2 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-[#0099B0] outline-none">
                                                        {Object.entries(CAMERA_TYPES).map(([id, t]) => {
                                                            const isDisabled = t.minFw === "v9.1.0+" && isOldFirmware;
                                                            return <option key={id} value={id} disabled={isDisabled}>{t.label} {isDisabled ? '(v9.1.0 + Only)' : ''}</option>
                                                        })}
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter ml-1">Device Qty</span>
                                                    <input type="number" min="1" value={group.quantity} onChange={e => updateGroup(group.id, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-full px-2 py-1.5 rounded-lg border border-slate-200 font-black text-xs text-[#0099B0] outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => setCameraGroups(cameraGroups.filter(g => g.id !== group.id))} 
                                            className="mt-4 text-[10px] font-bold text-slate-300 hover:text-red-500 flex items-center gap-1.5 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>

                                    <div className="flex-1 p-4 bg-white flex flex-col justify-between">
                                        <div className="space-y-4">
                                            {/* Row 1: Basic Engines (Object/Face) */}
                                            <div className="flex flex-wrap items-start gap-2">
                                                {row1Keys.map(key => groupedFeatures[key] && (
                                                    <div key={key} className="border border-slate-100 rounded-xl p-1.5 pb-1 relative mt-2 group/engine transition-colors hover:border-slate-200">
                                                        <span className="absolute -top-2 left-2 bg-white px-1.5 text-[7px] font-black text-slate-300 group-hover/engine:text-[#0099B0] uppercase tracking-tighter border border-slate-50 rounded transition-colors">
                                                            {ENGINE_LABELS[key]}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {groupedFeatures[key].map(feat => renderFeatureBtn(feat, group))}
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                {/* BI Engines for DV-1304 */}
                                                {biKeys.map(key => groupedFeatures[key] && (
                                                    <div key={key} className="border border-slate-100 rounded-xl p-1.5 pb-1 relative mt-2 group/engine transition-colors hover:border-slate-200">
                                                        <span className="absolute -top-2 left-2 bg-white px-1.5 text-[7px] font-black text-slate-300 group-hover/engine:text-[#0099B0] uppercase tracking-tighter border border-slate-50 rounded transition-colors">
                                                            {ENGINE_LABELS[key]}
                                                        </span>
                                                        <div className="flex flex-wrap gap-1 max-w-[400px]">
                                                            {groupedFeatures[key].map(feat => renderFeatureBtn(feat, group))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Row 2: Advanced & Attribute Engines (Only for Pro) */}
                                            <div className="flex flex-wrap items-start gap-2">
                                                {row2Keys.map(key => groupedFeatures[key] && (
                                                    <div key={key} className="border border-slate-100 rounded-xl p-1.5 pb-1 relative mt-2 group/engine transition-colors hover:border-slate-200">
                                                        <span className="absolute -top-2 left-2 bg-white px-1.5 text-[7px] font-black text-slate-300 group-hover/engine:text-[#0099B0] uppercase tracking-tighter border border-slate-50 rounded transition-colors">
                                                            {ENGINE_LABELS[key]}
                                                        </span>
                                                        <div className="flex gap-1">
                                                            {groupedFeatures[key].map(feat => renderFeatureBtn(feat, group))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-50 border-dashed mt-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded ${usage.enginesCount > 0 ? 'bg-[#eaf7ff] text-[#0099B0]' : 'bg-slate-50 text-slate-300'}`}>
                                                    {usage.enginesCount} / {config.maxConcurrentEngines || '∞'} Engines
                                                </span>
                                                {config.limitOneFeature && <span className="text-[9px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 uppercase tracking-tighter">Single Select Mode</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Cost:</span>
                                                <span className="text-sm font-black text-[#0099B0]">+{usage.units} Throughput</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </main>
                </div>
            </div>
        </div>
    );
}