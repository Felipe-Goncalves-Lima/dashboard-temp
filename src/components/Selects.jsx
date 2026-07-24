import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export const CustomSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); 
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return (
    <div ref={ref} style={{ position: 'relative' }}>
       <button onClick={() => setIsOpen(!isOpen)} className="tab-btn active" style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: '120px', justifyContent: 'space-between' }}>
          {value === 'Todos' ? placeholder : value}
          <ChevronDown size={14} />
       </button>
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '4px', zIndex: 9999, minWidth: '180px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)', maxHeight: '250px', overflowY: 'auto' }}>
            <div 
              style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === 'Todos' ? 'var(--status-success)' : '#fff', background: value === 'Todos' ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
              onClick={() => { onChange('Todos'); setIsOpen(false); }}
            >
              Todos
            </div>
            {options.map(opt => (
              <div 
                key={opt}
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === opt ? 'var(--status-success)' : '#fff', background: value === opt ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                onClick={() => { onChange(opt); setIsOpen(false); }}
              >
                {opt}
              </div>
            ))}
         </div>
       )}
    </div>
  );
};

export const SearchableSelect = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); 
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const filteredOptions = options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
  
  return (
    <div ref={ref} style={{ position: 'relative', width: '100%', maxWidth: '250px' }}>
       <div 
         className="tab-btn active" 
         style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 12px', width: '100%', cursor: 'pointer' }}
         onClick={() => setIsOpen(!isOpen)}
       >
         {value === 'Todos' ? placeholder : (value.length > 20 ? value.substring(0, 20) + '...' : value)}
         <ChevronDown size={14} />
       </div>
       
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', zIndex: 9999, minWidth: '240px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <input 
              type="text" 
              placeholder="Pesquisar..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff', outline: 'none' }}
              autoFocus
            />
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              <div 
                style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === 'Todos' ? 'var(--status-success)' : '#fff', background: value === 'Todos' ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                onClick={() => { onChange('Todos'); setIsOpen(false); setSearchTerm(''); }}
              >
                Todos
              </div>
              {filteredOptions.length === 0 && (
                <div style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '13px' }}>Nenhum encontrado</div>
              )}
              {filteredOptions.map(opt => (
                <div 
                  key={opt}
                  style={{ padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', color: value === opt ? 'var(--status-success)' : '#fff', background: value === opt ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '13px' }}
                  onClick={() => { onChange(opt); setIsOpen(false); setSearchTerm(''); }}
                >
                  {opt}
                </div>
              ))}
            </div>
         </div>
       )}
    </div>
  );
};


const CustomCalendar = ({ dateStr, onChange }) => {
  const safeDateStr = dateStr || new Date().toISOString().split('T')[0];
  // use local timezone parsing to avoid off-by-one errors (append T12:00:00)
  const selectedDate = new Date(safeDateStr + 'T12:00:00');
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 15));

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '8px', userSelect: 'none' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div onClick={(e) => { e.stopPropagation(); prevMonth(); }} style={{ padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><ChevronLeft size={16} color="#fff" /></div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <div onClick={(e) => { e.stopPropagation(); nextMonth(); }} style={{ padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '4px' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><ChevronRight size={16} color="#fff" /></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
        {weekDays.map((d, idx) => <span key={idx} style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{d}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
        {days.map((day, i) => {
          if (!day) return <div key={i} />;
          const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentDate.getMonth() && selectedDate.getFullYear() === currentDate.getFullYear();
          return (
            <div 
              key={i} 
              onClick={(e) => {
                e.stopPropagation();
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
                onChange(newDate.toISOString().split('T')[0]);
              }}
              style={{ padding: '6px 0', textAlign: 'center', fontSize: '13px', cursor: 'pointer', borderRadius: '4px', background: isSelected ? 'var(--status-success)' : 'transparent', color: isSelected ? '#000' : '#fff', fontWeight: isSelected ? 600 : 400, transition: 'all 0.1s' }}
              onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
              onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  );
};

export const DateSelect = ({ filter, setFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClick = (e) => { 
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); 
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const options = ['Hoje', '7 Dias', '30 Dias'];
  const isCustom = filter.startsWith('date:');
  
  let displayValue = filter;
  if (isCustom) {
    const safeDateStr = filter.split(':')[1] || new Date().toISOString().split('T')[0];
    const selectedDate = new Date(safeDateStr + 'T12:00:00');
    const currentYear = new Date().getFullYear();
    let formatted = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    if (selectedDate.getFullYear() !== currentYear) {
      formatted = selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
    }
    displayValue = `A partir de ${formatted}`;
  }
  else if (filter === '7 Dias') displayValue = 'Últimos 7 Dias';
  else if (filter === '30 Dias') displayValue = 'Últimos 30 Dias';
  
  return (
    <div ref={ref} style={{ position: 'relative' }}>
       <div 
         onClick={() => setIsOpen(!isOpen)} 
         className="filter-group glass-panel" 
         style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', userSelect: 'none' }}
       >
          <Calendar size={16} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '14px', color: '#fff' }}>
            {displayValue}
          </span>
          <ChevronDown size={14} color="var(--text-secondary)" />
       </div>
       
       {isOpen && (
         <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px', zIndex: 9999, minWidth: '220px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            {options.map(opt => (
              <div 
                key={opt}
                style={{ padding: '10px 14px', cursor: 'pointer', borderRadius: '6px', color: filter === opt ? 'var(--status-success)' : '#fff', background: filter === opt ? 'rgba(255,255,255,0.05)' : 'transparent', fontSize: '14px', transition: 'all 0.2s' }}
                onClick={() => { setFilter(opt); setIsOpen(false); }}
                onMouseEnter={(e) => { if(filter !== opt) e.currentTarget.style.background = 'rgba(255,255,255,0.02)' }}
                onMouseLeave={(e) => { if(filter !== opt) e.currentTarget.style.background = 'transparent' }}
              >
                {opt === '1 Ano' ? 'Último 1 Ano' : (opt === '6 Meses' ? 'Últimos 6 Meses' : (opt === '30 Dias' ? 'Últimos 30 Dias' : (opt === '7 Dias' ? 'Últimos 7 Dias' : 'Hoje')))}
              </div>
            ))}
            
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 0' }}></div>
            
            <div style={{ padding: '10px 14px', borderRadius: '6px', background: isCustom ? 'rgba(255,255,255,0.05)' : 'transparent', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'all 0.2s' }}>
              <span 
                style={{ cursor: 'pointer', color: isCustom ? 'var(--status-success)' : '#fff', fontSize: '14px' }}
                onClick={() => { 
                  if(!isCustom) { 
                    setFilter(`date:${new Date().toISOString().split('T')[0]}`); 
                  } 
                }}
              >
                Data Específica...
              </span>
              {isCustom && (
                <CustomCalendar dateStr={filter.split(':')[1]} onChange={(val) => setFilter(`date:${val}`)} />
              )}
            </div>
         </div>
       )}
    </div>
  );
};
