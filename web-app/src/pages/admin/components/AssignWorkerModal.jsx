import React from 'react';
import { B } from '../../../constants';

export default function AssignWorkerModal({ isOpen, onClose, workers, onAssign }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="card animate-fade-in" style={{ width: 400, padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: B.ink }}>Assign Worker</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        
        {workers.length === 0 ? (
          <p style={{ color: B.muted, fontSize: 14 }}>No workers available right now.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {workers.map(worker => (
              <div key={worker.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', border: `1.5px solid ${B.brd}`, borderRadius: 12
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: B.ink }}>{worker.name}</div>
                  <div style={{ fontSize: 12, color: B.inkLight }}>{worker.service_type}</div>
                </div>
                <button 
                  className="pbtn" 
                  style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8 }}
                  onClick={() => onAssign(worker.id)}
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
