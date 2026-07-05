import React, { useState, useEffect } from 'react';
import { storage } from '../../../utils/storage';
import { TOOLS } from '../../../utils/tools';

const OpsLineage = () => {
    const [lineage, setLineage] = useState([]);

    useEffect(() => {
        const recent = storage.getJSON('hub_recent_tools', []);

        const flow = recent.map(id => {
            const tool = TOOLS.find(t => t.id === id);
            return tool ? { title: tool.title, category: tool.category, icon: tool.icon } : { title: id, category: 'Unknown', icon: 'help_outline' };
        });
        setLineage(flow);
    }, []);

    return (
        <div className="card p-20 glass-card">
            <h3>Enhanced Tool Lineage</h3>
            <p className="smallest opacity-6 mb-15">Visualization of your tool navigation across categories.</p>

            {lineage.length > 0 ? (
                <div className="p-20 bg-surface rounded-lg border mt-15 shadow-inner">
                    <div className="flex-center flex-column gap-10">
                        <div className="p-10 bg-primary color-white rounded-lg w-full text-center shadow-sm font-bold flex-center gap-10">
                            <span className="material-icons">login</span>
                            Toolbox Entry
                        </div>

                        {lineage.map((item, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex-center flex-column py-5">
                                    <span className="material-icons opacity-3" style={{fontSize: '1.2rem'}}>south</span>
                                </div>
                                <div className="card p-12 bg-surface border rounded-xl w-full animate-fadeIn shadow-sm hover-scale" style={{animationDelay: `${idx * 0.1}s`, borderLeft: '4px solid var(--primary)'}}>
                                    <div className="flex-between">
                                        <div className="flex gap-10">
                                            <span className="material-icons color-primary">{item.icon}</span>
                                            <div className="text-left">
                                                <div className="small font-bold">{item.title}</div>
                                                <div className="smallest opacity-5">{item.category}</div>
                                            </div>
                                        </div>
                                        <span className="badge smallest" style={{background: 'var(--primary-glow)'}}>Step {idx + 1}</span>
                                    </div>
                                </div>
                            </React.Fragment>
                        ))}

                        <div className="flex-center flex-column py-5">
                            <span className="material-icons opacity-3" style={{fontSize: '1.2rem'}}>south</span>
                        </div>
                        <div className="p-10 bg-accent color-white rounded-lg w-full text-center shadow-sm font-bold flex-center gap-10">
                            <span className="material-icons">location_on</span>
                            Current Context
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-40 text-center opacity-4">
                    <span className="material-icons" style={{fontSize: '3rem'}}>account_tree</span>
                    <p>No recent tool lineage found. Start exploring the toolbox!</p>
                </div>
            )}

            <div className="mt-15 p-12 bg-surface-variant rounded-lg smallest opacity-8 flex-center gap-10 border">
                <span className="material-icons color-primary" style={{fontSize: '1.1rem'}}>verified_user</span>
                <span>Lineage is reconstructed from local session state for privacy.</span>
            </div>
        </div>
    );
};

export default OpsLineage;
