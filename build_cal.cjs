const fs = require('fs');

let content = fs.readFileSync('c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/components/Selects.jsx', 'utf8');

// 1. Update imports
if (!content.includes('ChevronLeft')) {
  content = content.replace(
    "import { ChevronDown, Calendar } from 'lucide-react';",
    "import { ChevronDown, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';"
  );
}

// 2. Add CustomCalendar component before DateSelect
const customCalendarCode = `
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

export const DateSelect`;

if (!content.includes('CustomCalendar =')) {
  content = content.replace('export const DateSelect', customCalendarCode);
}

// 3. Replace the native input with CustomCalendar
const oldInput = `<input 
                  type="date" 
                  value={filter.split(':')[1]} 
                  onChange={(e) => setFilter(\`date:\${e.target.value}\`)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 12px', borderRadius: '6px', outline: 'none', colorScheme: 'dark', width: '100%', fontSize: '14px' }}
                />`;

const newInput = `<CustomCalendar dateStr={filter.split(':')[1]} onChange={(val) => setFilter(\`date:\${val}\`)} />`;

if (content.includes(oldInput)) {
  content = content.replace(oldInput, newInput);
}

fs.writeFileSync('c:/Users/felip/Documents/ForcaDIgital/frontTempCliente/frontTempCliente/src/components/Selects.jsx', content);
console.log('Successfully updated Selects.jsx with CustomCalendar');
