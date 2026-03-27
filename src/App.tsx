import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, 
  Users, 
  BookOpen, 
  Heart, 
  Calendar, 
  GraduationCap, 
  Plus, 
  PlusCircle,
  Trash2, 
  CheckCircle2, 
  UserPlus, 
  Search,
  ChevronRight,
  Menu,
  X,
  CreditCard,
  Cake,
  History,
  RotateCcw,
  MessageCircle,
  DollarSign,
  Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameDay, parseISO, isSameMonth, isSameYear, getMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from './lib/utils';
import { 
  Student, 
  Class, 
  Teacher, 
  Attendance, 
  LessonRequest, 
  Magazine, 
  Tab,
  LessonPrices
} from './types';

interface ModalState {
  isOpen: boolean;
  type: 'form' | 'confirm' | 'history';
  title: string;
  message?: string;
  fields?: { name: string; label: string; type: string; defaultValue?: string; options?: { value: string; label: string }[] }[];
  historyData?: Attendance[];
  onConfirm: (data?: any) => void;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
}

// Initial Data
const INITIAL_CLASSES: Class[] = [
  { id: '1', name: 'Berçário', teacherId: '1', description: '0 a 2 anos' },
  { id: '2', name: 'Maternal', teacherId: '2', description: '3 a 4 anos' },
  { id: '3', name: 'Primários', teacherId: '3', description: '5 a 6 anos' },
  { id: '4', name: 'Juniores', teacherId: '4', description: '7 a 8 anos' },
  { id: '5', name: 'Adolescentes', teacherId: '5', description: '12 a 17 anos' },
  { id: '6', name: 'Jovens', teacherId: '6', description: '18 a 35 anos' },
  { id: '7', name: 'Adultos', teacherId: '7', description: '35+ anos' },
];

const INITIAL_TEACHERS: Teacher[] = [
  { id: '1', name: 'Maria Silva', phone: '92991234567' },
  { id: '2', name: 'João Santos', phone: '92992345678' },
  { id: '3', name: 'Ana Oliveira', phone: '92993456789' },
  { id: '4', name: 'Pedro Souza', phone: '92994567890' },
  { id: '5', name: 'Carla Lima', phone: '92995678901' },
  { id: '6', name: 'Marcos Rocha', phone: '92996789012' },
  { id: '7', name: 'Lucia Ferreira', phone: '92997890123' },
];

export default function App() {
  // State
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'confirm',
    title: '',
    onConfirm: () => {},
  });

  const closeModal = () => setModal(prev => ({ ...prev, isOpen: false }));

  const openConfirm = (title: string, message: string, onConfirm: () => void, confirmText = 'Confirmar', confirmColor = 'bg-blue-600') => {
    setModal({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm,
      confirmText,
      confirmColor
    });
  };

  const openForm = (title: string, fields: any[], onConfirm: (data: any) => void, confirmText = 'Salvar') => {
    setModal({
      isOpen: true,
      type: 'form',
      title,
      fields,
      onConfirm,
      confirmText
    });
  };

  const openHistory = (title: string, historyData: Attendance[]) => {
    setModal({
      isOpen: true,
      type: 'history',
      title,
      historyData,
      onConfirm: () => {},
      confirmText: 'Fechar'
    });
  };
  
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ebd_students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [classes, setClasses] = useState<Class[]>(() => {
    const saved = localStorage.getItem('ebd_classes');
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('ebd_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });
  
  const [attendance, setAttendance] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('ebd_attendance');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [lessonRequests, setLessonRequests] = useState<LessonRequest[]>(() => {
    const saved = localStorage.getItem('ebd_lesson_requests');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [magazines, setMagazines] = useState<Magazine[]>(() => {
    const saved = localStorage.getItem('ebd_magazines');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'A Importância da Oração', quarter: '1º Trimestre', year: 2026, studied: false, read: false },
      { id: '2', title: 'As Parábolas de Jesus', quarter: '4º Trimestre', year: 2025, studied: true, read: true },
    ];
  });

  const [lessonPrices, setLessonPrices] = useState<LessonPrices>(() => {
    const saved = localStorage.getItem('ebd_lesson_prices');
    if (saved) return JSON.parse(saved);
    
    return {
      profAdulto: '25,00',
      alunoAdulto: '25,00',
      profCrianca: '25,00',
      alunoCrianca: '25,00',
      profAdolescente: '25,00',
      alunoAdolescente: '25,00'
    };
  });

  // Persistence
  useEffect(() => {
    localStorage.setItem('ebd_students', JSON.stringify(students));
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('ebd_classes', JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem('ebd_teachers', JSON.stringify(teachers));
  }, [teachers]);
  
  useEffect(() => {
    localStorage.setItem('ebd_attendance', JSON.stringify(attendance));
  }, [attendance]);
  
  useEffect(() => {
    localStorage.setItem('ebd_lesson_requests', JSON.stringify(lessonRequests));
  }, [lessonRequests]);
  
  useEffect(() => {
    localStorage.setItem('ebd_magazines', JSON.stringify(magazines));
  }, [magazines]);

  useEffect(() => {
    localStorage.setItem('ebd_lesson_prices', JSON.stringify(lessonPrices));
  }, [lessonPrices]);

  // Derived Data
  const today = new Date();
  const presentTodayCount = useMemo(() => {
    return attendance.filter(a => isSameDay(parseISO(a.date), today) && a.present).length;
  }, [attendance]);

  const birthdayCelebrants = useMemo(() => {
    return students.filter(s => {
      const birthDate = parseISO(s.birthDate);
      return getMonth(birthDate) === getMonth(today);
    });
  }, [students]);

  // Actions
  const addStudent = (name: string, classId: string, birthDate: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name,
      classId,
      birthDate,
      active: true
    };
    setStudents([...students, newStudent]);
  };

  const editStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    openForm('Editar Aluno', [
      { name: 'name', label: 'Nome do Aluno', type: 'text', defaultValue: student.name },
      { 
        name: 'classId', 
        label: 'Classe', 
        type: 'select', 
        defaultValue: student.classId,
        options: classes.map(c => ({ value: c.id, label: c.name }))
      },
      { name: 'birthDate', label: 'Data de Nascimento', type: 'date', defaultValue: student.birthDate }
    ], (data) => {
      setStudents(students.map(s => s.id === id ? { ...s, ...data } : s));
    });
  };

  const viewStudentHistory = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const history = attendance
      .filter(a => a.studentId === studentId)
      .sort((a, b) => b.date.localeCompare(a.date));
      
    openHistory(`Histórico: ${student.name}`, history);
  };

  const deleteStudent = (id: string) => {
    openConfirm(
      'Excluir Aluno',
      'Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita.',
      () => {
        setStudents(students.filter(s => s.id !== id));
        setAttendance(attendance.filter(a => a.studentId !== id));
      },
      'Excluir',
      'bg-rose-600'
    );
  };

  const deleteBirthdaysOfMonth = () => {
    if (birthdayCelebrants.length === 0) return;
    openConfirm(
      'Excluir Aniversariantes',
      `ATENÇÃO: Isso excluirá TODOS os ${birthdayCelebrants.length} alunos que fazem aniversário este mês. Deseja continuar?`,
      () => {
        const celebrantIds = new Set(birthdayCelebrants.map(s => s.id));
        setStudents(students.filter(s => !celebrantIds.has(s.id)));
        setAttendance(attendance.filter(a => !celebrantIds.has(a.studentId)));
      },
      'Excluir Tudo',
      'bg-rose-600'
    );
  };

  const deleteAllStudents = () => {
    if (students.length === 0) return;
    openConfirm(
      'Excluir Todos os Alunos',
      'ATENÇÃO: Isso excluirá TODOS os alunos e seus registros de presença. Esta ação não pode ser desfeita. Deseja continuar?',
      () => {
        setStudents([]);
        setAttendance([]);
      },
      'Excluir Tudo',
      'bg-rose-600'
    );
  };

  const addTeacher = () => {
    openForm('Novo Professor', [
      { name: 'name', label: 'Nome do Professor', type: 'text' },
      { name: 'phone', label: 'Telefone', type: 'tel' }
    ], (data) => {
      const newTeacher: Teacher = {
        id: crypto.randomUUID(),
        ...data
      };
      setTeachers([...teachers, newTeacher]);
    });
  };

  const editTeacher = (id: string) => {
    const teacher = teachers.find(t => t.id === id);
    if (!teacher) return;
    
    openForm('Editar Professor', [
      { name: 'name', label: 'Nome do Professor', type: 'text', defaultValue: teacher.name },
      { name: 'phone', label: 'Telefone', type: 'tel', defaultValue: teacher.phone }
    ], (data) => {
      setTeachers(teachers.map(t => t.id === id ? { ...t, ...data } : t));
    });
  };

  const deleteTeacher = (id: string) => {
    openConfirm(
      'Excluir Professor',
      'Tem certeza que deseja excluir este professor?',
      () => {
        setTeachers(teachers.filter(t => t.id !== id));
      },
      'Excluir',
      'bg-rose-600'
    );
  };

  const addClass = () => {
    openForm('Nova Classe', [
      { name: 'name', label: 'Nome da Classe', type: 'text' },
      { name: 'description', label: 'Descrição', type: 'text' },
      { 
        name: 'teacherId', 
        label: 'Professor Responsável', 
        type: 'select', 
        options: teachers.map(t => ({ value: t.id, label: t.name }))
      }
    ], (data) => {
      const newClass: Class = {
        id: crypto.randomUUID(),
        ...data
      };
      setClasses([...classes, newClass]);
    });
  };

  const editClass = (id: string) => {
    const cls = classes.find(c => c.id === id);
    if (!cls) return;
    
    openForm('Editar Classe', [
      { name: 'name', label: 'Nome da Classe', type: 'text', defaultValue: cls.name },
      { name: 'description', label: 'Descrição', type: 'text', defaultValue: cls.description },
      { 
        name: 'teacherId', 
        label: 'Professor Responsável', 
        type: 'select', 
        defaultValue: cls.teacherId,
        options: teachers.map(t => ({ value: t.id, label: t.name }))
      }
    ], (data) => {
      setClasses(classes.map(c => c.id === id ? { ...c, ...data } : c));
    });
  };

  const deleteClass = (id: string) => {
    openConfirm(
      'Excluir Classe',
      'Tem certeza que deseja excluir esta classe?',
      () => {
        setClasses(classes.filter(c => c.id !== id));
      },
      'Excluir',
      'bg-rose-600'
    );
  };

  const addMagazine = (studied: boolean) => {
    openForm('Nova Revista', [
      { name: 'title', label: 'Título da Revista', type: 'text' },
      { 
        name: 'quarter', 
        label: 'Trimestre', 
        type: 'select', 
        defaultValue: '1º Trimestre',
        options: [
          { value: '1º Trimestre', label: '1º Trimestre' },
          { value: '2º Trimestre', label: '2º Trimestre' },
          { value: '3º Trimestre', label: '3º Trimestre' },
          { value: '4º Trimestre', label: '4º Trimestre' }
        ]
      },
      { name: 'year', label: 'Ano', type: 'number', defaultValue: new Date().getFullYear().toString() },
      { name: 'pdfUrl', label: 'Link do PDF (Opcional)', type: 'text' }
    ], (data) => {
      const newMagazine: Magazine = {
        id: crypto.randomUUID(),
        ...data,
        year: parseInt(data.year),
        studied,
        read: false
      };
      setMagazines([...magazines, newMagazine]);
    });
  };

  const deleteMagazine = (id: string) => {
    openConfirm(
      'Excluir Revista',
      'Tem certeza que deseja excluir esta revista?',
      () => {
        setMagazines(magazines.filter(m => m.id !== id));
      },
      'Excluir',
      'bg-rose-600'
    );
  };

  const toggleMagazineStudied = (id: string) => {
    setMagazines(magazines.map(m => m.id === id ? { ...m, studied: !m.studied } : m));
  };

  const toggleMagazineRead = (id: string) => {
    setMagazines(magazines.map(m => m.id === id ? { ...m, read: !m.read } : m));
  };

  const clearStudiedMagazines = () => {
    openConfirm(
      'Limpar Histórico',
      'Deseja excluir permanentemente todas as revistas do histórico?',
      () => {
        setMagazines(magazines.filter(m => !m.studied));
      },
      'Limpar Tudo',
      'bg-rose-600'
    );
  };

  const registerPresence = (studentId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = attendance.find(a => a.studentId === studentId && a.date === dateStr);
    
    if (existing) {
      setAttendance(attendance.map(a => a.id === existing.id ? { ...a, present: !a.present } : a));
    } else {
      setAttendance([...attendance, { id: crypto.randomUUID(), studentId, date: dateStr, present: true }]);
    }
  };

  const addLessonRequest = (studentName: string, classId: string, observation: string) => {
    const newRequest: LessonRequest = {
      id: crypto.randomUUID(),
      studentName,
      classId,
      date: format(today, 'yyyy-MM-dd'),
      delivered: false,
      observation
    };
    setLessonRequests([newRequest, ...lessonRequests]);
  };

  const deleteLessonRequest = (id: string) => {
    setLessonRequests(lessonRequests.filter(r => r.id !== id));
  };

  const deleteAllLessonRequests = () => {
    openConfirm(
      'Excluir Todos os Pedidos',
      'Tem certeza que deseja excluir permanentemente todos os pedidos de lição?',
      () => {
        setLessonRequests([]);
      },
      'Excluir Tudo',
      'bg-rose-600'
    );
  };

  const toggleLessonDelivered = (id: string) => {
    setLessonRequests(lessonRequests.map(r => r.id === id ? { ...r, delivered: !r.delivered } : r));
  };

  // Components
  const SidebarItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setIsSidebarOpen(false); }}
      className={cn(
        "flex items-center gap-3 w-full p-3 rounded-xl transition-all duration-200",
        activeTab === id 
          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
          : "text-slate-600 hover:bg-slate-100"
      )}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <BookOpen size={20} />
          </div>
          <h1 className="font-bold text-lg tracking-tight uppercase">EBD MANAGER P3</h1>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </header>

      {/* Sidebar / Navigation */}
      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn(
              "fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r p-6 z-50 flex flex-col gap-8 overflow-y-auto",
              !isSidebarOpen && "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2.5 rounded-xl text-white shadow-md">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h1 className="font-bold text-xl tracking-tight uppercase">EBD MANAGER</h1>
                  <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">CONGREGAÇÃO P3</p>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-slate-400">
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              <SidebarItem id="home" icon={Home} label="Início" />
              <SidebarItem id="classes" icon={Users} label="Classes EBD" />
              <SidebarItem id="students" icon={UserPlus} label="Alunos" />
              <SidebarItem id="lessons" icon={PlusCircle} label="Pedidos de Lição" />
              <SidebarItem id="prices" icon={DollarSign} label="Valores das Lições" />
              <SidebarItem id="magazines" icon={BookOpen} label="Revistas do Trimestre" />
              <SidebarItem id="studied" icon={History} label="Revistas Estudadas" />
              <SidebarItem id="teachers" icon={GraduationCap} label="Professores" />
              <SidebarItem id="birthdays" icon={Cake} label="Aniversariantes" />
            </nav>

            <div className="mt-auto pt-6 border-t">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase mb-2">LIÇÃO EBD</p>
                <p className="text-sm text-blue-800 mb-3 leading-relaxed">Faça seu pagamento via pix para apoiar o projeto</p>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-blue-200">
                  <CreditCard size={16} className="text-blue-600" />
                  <span className="text-xs font-mono font-bold">92994674857</span>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Olá, Bem-vindo!</h2>
                  <p className="text-slate-500">Gestão completa da sua Escola Bíblica Dominical.</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-full border shadow-sm flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" />
                  <span className="font-medium text-sm">{format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Classes" 
                  value={classes.length} 
                  icon={Users} 
                  color="bg-blue-500" 
                  onClick={() => setActiveTab('classes')}
                />
                <StatCard 
                  title="Alunos Ativos" 
                  value={students.filter(s => s.active).length} 
                  icon={UserPlus} 
                  color="bg-emerald-500" 
                  onClick={() => setActiveTab('students')}
                />
                <StatCard 
                  title="Alunos Presentes" 
                  value={presentTodayCount} 
                  icon={CheckCircle2} 
                  color="bg-amber-500" 
                  onClick={() => setActiveTab('home')}
                />
                <StatCard 
                  title="Pedidos de Lição" 
                  value={lessonRequests.filter(r => !r.delivered).length} 
                  icon={PlusCircle} 
                  color="bg-amber-500" 
                  onClick={() => setActiveTab('lessons')}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-2 space-y-6">
                  <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Plus size={20} className="text-blue-600" />
                      Ações Rápidas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <QuickActionButton 
                        label="Registrar Presença" 
                        description="Marcar frequência dos alunos hoje"
                        icon={CheckCircle2}
                        onClick={() => setActiveTab('students')}
                      />
                      <QuickActionButton 
                        label="Novo Pedido de Lição" 
                        description="Registrar aluno sem revista"
                        icon={PlusCircle}
                        onClick={() => setActiveTab('lessons')}
                      />
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold mb-4">Frequência Semanal</h3>
                    <div className="bg-white p-6 rounded-3xl border shadow-sm h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Dom 1', count: 45 },
                          { name: 'Dom 2', count: 52 },
                          { name: 'Dom 3', count: 48 },
                          { name: 'Dom 4', count: 61 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: '#f8fafc' }}
                          />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            { [0,1,2,3].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 3 ? '#2563eb' : '#94a3b8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </section>
                </div>

                {/* Sidebar Widgets */}
                <div className="space-y-6">
                  <section>
                    <h3 className="text-lg font-bold mb-4">Aniversariantes do Mês</h3>
                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                      {birthdayCelebrants.length > 0 ? (
                        <div className="divide-y">
                          {birthdayCelebrants.slice(0, 5).map(s => (
                            <div key={s.id} className="p-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold">
                                {s.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-sm">{s.name}</p>
                                <p className="text-xs text-slate-500">{format(parseISO(s.birthDate), "d 'de' MMMM", { locale: ptBR })}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Cake size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500">Nenhum aniversariante este mês.</p>
                        </div>
                      )}
                      <button 
                        onClick={() => setActiveTab('birthdays')}
                        className="w-full p-3 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Ver todos
                      </button>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold mb-4">Últimos Pedidos de Lição</h3>
                    <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                      <div className="divide-y">
                        {lessonRequests.slice(0, 3).map(r => (
                          <div key={r.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{r.studentName}</p>
                              <button onClick={() => deleteLessonRequest(r.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <p className="text-sm text-slate-700 line-clamp-2 italic">"{r.observation || 'Solicitou a nova lição do trimestre.'}"</p>
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => setActiveTab('lessons')}
                        className="w-full p-3 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Gerenciar pedidos
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'classes' && (
            <motion.div
              key="classes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Classes EBD</h2>
                <button 
                  onClick={addClass}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Plus size={18} />
                  Nova Classe
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map(c => (
                  <div key={c.id} className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-shadow group flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Users size={24} />
                      </div>
                      <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-full text-slate-500">
                        {students.filter(s => s.classId === c.id).length} Alunos
                      </span>
                    </div>
                    <h4 className="text-xl font-bold mb-1">{c.name}</h4>
                    <p className="text-sm text-slate-500 mb-4 flex-1">{c.description}</p>
                    <div className="pt-4 border-t flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">
                          Prof. {teachers.find(t => t.id === c.teacherId)?.name || 'Não atribuído'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => editClass(c.id)}
                          className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => deleteClass(c.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'students' && (
            <motion.div
              key="students"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold tracking-tight">Alunos</h2>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <input 
                      type="date" 
                      value={format(selectedDate, 'yyyy-MM-dd')}
                      onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                      className="text-sm font-bold bg-transparent border-none focus:ring-0 cursor-pointer hover:text-blue-600 transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={deleteAllStudents}
                    className="bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    Excluir Tudo
                  </button>
                  <button 
                    onClick={() => {
                      openForm('Novo Aluno', [
                        { name: 'name', label: 'Nome do Aluno', type: 'text' },
                        { 
                          name: 'classId', 
                          label: 'Classe', 
                          type: 'select', 
                          options: classes.map(c => ({ value: c.id, label: c.name }))
                        },
                        { name: 'birthDate', label: 'Data de Nascimento', type: 'date', defaultValue: '2010-01-01' }
                      ], (data) => {
                        addStudent(data.name, data.classId, data.birthDate);
                      });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <UserPlus size={18} />
                    Novo Aluno
                  </button>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar aluno por nome..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="p-1 hover:bg-slate-100 rounded-full">
                  <X size={14} className="text-slate-400" />
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nome</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Classe</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nascimento</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Presença</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Frequência (Mês)</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).length > 0 ? 
                        students
                          .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map(s => {
                            const isPresent = attendance.some(a => a.studentId === s.id && isSameDay(parseISO(a.date), selectedDate) && a.present);
                            const monthlyPresences = attendance.filter(a => 
                              a.studentId === s.id && 
                              a.present && 
                              isSameMonth(parseISO(a.date), today) &&
                              isSameYear(parseISO(a.date), today)
                            ).length;

                            return (
                              <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                      {s.name.charAt(0)}
                                    </div>
                                    <span className="font-medium">{s.name}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {classes.find(c => c.id === s.classId)?.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600">
                                  {format(parseISO(s.birthDate), 'dd/MM/yyyy')}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <button 
                                    onClick={() => registerPresence(s.id, selectedDate)}
                                    className={cn(
                                      "p-2 rounded-lg transition-all mx-auto block",
                                      isPresent 
                                        ? "bg-emerald-100 text-emerald-600" 
                                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                    )}
                                    title="Presença"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs">
                                    {monthlyPresences}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => viewStudentHistory(s.id)}
                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Ver Histórico"
                                    >
                                      <History size={18} />
                                    </button>
                                    <button 
                                      onClick={() => editStudent(s.id)}
                                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Editar"
                                    >
                                      <Plus size={18} className="rotate-45" />
                                    </button>
                                    <button 
                                      onClick={() => deleteStudent(s.id)}
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                      title="Excluir"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          }) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                            {searchTerm ? `Nenhum aluno encontrado para "${searchTerm}"` : "Nenhum aluno cadastrado. Use o botão \"Novo Aluno\" para começar."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'lessons' && (
            <motion.div
              key="lessons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl">
                      <CreditCard size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-amber-900">Pagamento da Lição</h3>
                      <p className="text-sm text-amber-700">
                        Faça o pagamento via PIX <span className="font-bold">92994674857</span> para receber sua lição.
                        <span className="block mt-1 font-bold">Valor: R$ 25,00</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      openForm('Editar Valores das Lições', [
                        { name: 'profAdulto', label: 'Prof. Adulto (R$)', type: 'text', defaultValue: lessonPrices.profAdulto },
                        { name: 'alunoAdulto', label: 'Aluno Adulto (R$)', type: 'text', defaultValue: lessonPrices.alunoAdulto },
                        { name: 'profCrianca', label: 'Prof. Criança (R$)', type: 'text', defaultValue: lessonPrices.profCrianca },
                        { name: 'alunoCrianca', label: 'Aluno Criança (R$)', type: 'text', defaultValue: lessonPrices.alunoCrianca },
                        { name: 'profAdolescente', label: 'Prof. Adolescente (R$)', type: 'text', defaultValue: lessonPrices.profAdolescente },
                        { name: 'alunoAdolescente', label: 'Aluno Adolescente (R$)', type: 'text', defaultValue: lessonPrices.alunoAdolescente },
                      ], (data) => {
                        setLessonPrices(data as LessonPrices);
                      });
                    }}
                    className="flex items-center gap-2 bg-white text-amber-600 border border-amber-200 px-4 py-2 rounded-xl font-bold hover:bg-amber-50 transition-colors"
                  >
                    <Pencil size={18} />
                    Editar Valores
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Prof. Adulto', value: lessonPrices.profAdulto },
                    { label: 'Aluno Adulto', value: lessonPrices.alunoAdulto },
                    { label: 'Prof. Criança', value: lessonPrices.profCrianca },
                    { label: 'Aluno Criança', value: lessonPrices.alunoCrianca },
                    { label: 'Prof. Adolescente', value: lessonPrices.profAdolescente },
                    { label: 'Aluno Adolescente', value: lessonPrices.alunoAdolescente },
                  ].map((p, idx) => (
                    <div key={idx} className="bg-white/50 p-3 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">{p.label}</p>
                      <p className="font-bold text-amber-900">R$ {p.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Pedidos da Nova Lição</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={deleteAllLessonRequests}
                    className="bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    Excluir Tudo
                  </button>
                  <button 
                    onClick={() => {
                      openForm('Novo Pedido de Lição', [
                        { name: 'studentName', label: 'Nome do Aluno', type: 'text' },
                        { 
                          name: 'classId', 
                          label: 'Classe', 
                          type: 'select', 
                          options: classes.map(c => ({ value: c.id, label: c.name }))
                        },
                        { name: 'observation', label: 'Observação (Opcional)', type: 'text' }
                      ], (data) => {
                        addLessonRequest(data.studentName, data.classId, data.observation);
                      });
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <Plus size={18} />
                    Novo Pedido
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lessonRequests.length > 0 ? lessonRequests.map(r => (
                  <div key={r.id} className={cn(
                    "p-6 rounded-3xl border shadow-sm transition-all",
                    r.delivered ? "bg-emerald-50 border-emerald-100 opacity-75" : "bg-white"
                  )}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "p-2 rounded-xl",
                          r.delivered ? "bg-emerald-200 text-emerald-700" : "bg-amber-100 text-amber-600"
                        )}>
                          <PlusCircle size={18} />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{r.studentName}</p>
                          <p className="text-xs text-slate-400">{format(parseISO(r.date), "d 'de' MMMM", { locale: ptBR })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleLessonDelivered(r.id)}
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            r.delivered ? "text-emerald-600 bg-emerald-100" : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          )}
                          title={r.delivered ? "Marcar como pendente" : "Marcar como entregue"}
                        >
                          <CheckCircle2 size={18} />
                        </button>
                        <button 
                          onClick={() => deleteLessonRequest(r.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir pedido"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Classe: {classes.find(c => c.id === r.classId)?.name || 'N/A'}
                      </p>
                      <p className={cn(
                        "text-slate-700 leading-relaxed italic",
                        r.delivered && "line-through text-slate-400"
                      )}>
                        "{r.observation || 'Solicitou a nova lição do trimestre.'}"
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-slate-400 italic">
                    Nenhum pedido de lição registrado.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'prices' && (
            <motion.div
              key="prices"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Valores das Lições</h2>
              </div>

              <div className="bg-white p-8 rounded-3xl border shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                    <DollarSign size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Configurar Valores</h3>
                    <p className="text-sm text-slate-500">Defina os valores das lições por categoria.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'profAdulto', label: 'Professor Adulto' },
                    { key: 'alunoAdulto', label: 'Aluno Adulto' },
                    { key: 'profCrianca', label: 'Professor Criança' },
                    { key: 'alunoCrianca', label: 'Aluno Criança' },
                    { key: 'profAdolescente', label: 'Professor Adolescente' },
                    { key: 'alunoAdolescente', label: 'Aluno Adolescente' },
                  ].map((item) => (
                    <div key={item.key}>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{item.label} (R$)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                        <input 
                          type="text" 
                          value={lessonPrices[item.key as keyof LessonPrices]}
                          onChange={(e) => setLessonPrices(prev => ({ ...prev, [item.key]: e.target.value }))}
                          placeholder="0,00"
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => {
                      openConfirm('Sucesso', 'Os valores das lições foram atualizados com sucesso!', () => {}, 'Ok', 'bg-blue-600');
                    }}
                    className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'magazines' && (
            <motion.div
              key="magazines"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Revistas do Trimestre</h2>
                <button 
                  onClick={() => addMagazine(false)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Plus size={18} />
                  Nova Revista
                </button>
              </div>
              
              <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
                <div className="relative z-10 space-y-4 max-w-lg">
                  <h3 className="text-3xl font-bold">Apoie nosso trabalho!</h3>
                  <p className="text-blue-100 leading-relaxed">
                    Adquira as revistas digitais do trimestre e receba o material completo para suas aulas. 
                    Toda a arrecadação é revertida para a manutenção do sistema EBD MANAGER P3.
                  </p>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl">
                    <p className="text-sm font-medium text-blue-100 mb-2">
                      APÓS O PAGAMENTO ENTRE EM CONTATO COM A ADMIN PELO NÚMERO (92) 993413166 que será enviado o seu pdf via WhatsApp.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <div className="bg-white/10 p-3 rounded-xl flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200 mb-1">Chave PIX</p>
                        <p className="text-lg font-mono font-bold">92994674857</p>
                      </div>
                      <a 
                        href="https://wa.me/5592993413166?text=Olá! Acabei de realizar o pagamento do apoio ao EBD Manager P3. Gostaria de receber o PDF da revista."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                      >
                        <MessageCircle size={20} />
                        Enviar Comprovante
                      </a>
                    </div>
                  </div>
                </div>
                <CreditCard className="absolute -right-8 -bottom-8 text-white/10 w-64 h-64" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {magazines.filter(m => !m.studied).map(m => (
                  <div key={m.id} className="bg-white p-6 rounded-3xl border shadow-sm flex gap-6 items-center relative group">
                    <div className="w-24 h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300 border-2 border-dashed">
                      <BookOpen size={32} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                          {m.quarter}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{m.year}</span>
                      </div>
                      <h4 className="text-lg font-bold mb-2">{m.title}</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Não Estudada</span>
                      </div>
                      <div className="flex items-center gap-4">
                        {m.pdfUrl ? (
                          <a 
                            href={m.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                          >
                            Baixar PDF <ChevronRight size={14} />
                          </a>
                        ) : (
                          <button 
                            disabled
                            className="text-sm font-bold text-slate-400 flex items-center gap-1 cursor-not-allowed opacity-50"
                            title="Link do PDF não disponível"
                          >
                            Baixar PDF <ChevronRight size={14} />
                          </button>
                        )}
                        <button 
                          onClick={() => toggleMagazineStudied(m.id)}
                          className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          Marcar como Estudada
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => deleteMagazine(m.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-2 text-xs font-bold"
                        title="Excluir revista"
                      >
                        <Trash2 size={18} />
                        <span className="hidden sm:inline">Remover</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'studied' && (
            <motion.div
              key="studied"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Revistas Estudadas</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={clearStudiedMagazines}
                    className="bg-rose-50 text-rose-600 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors"
                  >
                    <Trash2 size={18} />
                    Limpar Histórico
                  </button>
                  <button 
                    onClick={() => addMagazine(true)}
                    className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200"
                  >
                    <Plus size={18} />
                    Nova Revista Estudada
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {magazines.filter(m => m.studied).map(m => (
                  <div key={m.id} className="bg-white p-6 rounded-3xl border shadow-sm relative group flex flex-col hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full uppercase">
                          {m.quarter}
                        </span>
                        <span className="text-xs font-bold text-slate-400">{m.year}</span>
                      </div>
                      <div className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        m.read ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {m.read ? "Lida" : "Não Lida"}
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-bold mb-4 flex-1">{m.title}</h4>
                    
                    {m.pdfUrl && (
                      <a 
                        href={m.pdfUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mb-4 text-sm font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        Baixar PDF <ChevronRight size={14} />
                      </a>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                      <button 
                        onClick={() => toggleMagazineRead(m.id)}
                        className={cn(
                          "py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1",
                          m.read ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        {m.read ? "Marcar Não Lida" : "Marcar Lida"}
                      </button>
                      <button 
                        onClick={() => deleteMagazine(m.id)}
                        className="py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all flex items-center justify-center gap-1"
                      >
                        <Trash2 size={14} />
                        Remover
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => toggleMagazineStudied(m.id)}
                      className="mt-3 py-2 rounded-xl text-xs font-bold text-slate-400 border border-dashed border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center justify-center gap-1"
                    >
                      <RotateCcw size={14} />
                      Reativar Revista
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'teachers' && (
            <motion.div
              key="teachers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Corpo Docente</h2>
                <button 
                  onClick={addTeacher}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  <Plus size={18} />
                  Novo Professor
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-3xl border shadow-sm flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <GraduationCap size={32} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg">{t.name}</h4>
                        <p className="text-sm text-slate-500 mb-2">{t.phone}</p>
                        <div className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                          {classes.find(c => c.teacherId === t.id)?.name || 'Reserva'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <button 
                        onClick={() => editTeacher(t.id)}
                        className="flex-1 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => deleteTeacher(t.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'birthdays' && (
            <motion.div
              key="birthdays"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">Aniversariantes do Mês</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={deleteBirthdaysOfMonth}
                    className="bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 size={18} />
                    Excluir Todos do Mês
                  </button>
                  <button 
                    onClick={() => {
                      openForm('Novo Aniversariante', [
                        { name: 'name', label: 'Nome do Aniversariante', type: 'text' },
                        { 
                          name: 'classId', 
                          label: 'Classe', 
                          type: 'select', 
                          options: classes.map(c => ({ value: c.id, label: c.name }))
                        },
                        { name: 'birthDate', label: 'Data de Nascimento', type: 'date', defaultValue: '2010-01-01' }
                      ], (data) => {
                        addStudent(data.name, data.classId, data.birthDate);
                      });
                    }}
                    className="bg-pink-600 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200"
                  >
                    <Plus size={18} />
                    Novo Aniversariante
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {birthdayCelebrants.length > 0 ? birthdayCelebrants.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border shadow-sm flex items-center gap-4 relative overflow-hidden group">
                    <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xl">
                      {s.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg truncate">{s.name}</h4>
                      <p className="text-sm text-slate-500">
                        {format(parseISO(s.birthDate), "d 'de' MMMM", { locale: ptBR })}
                      </p>
                      <p className="text-xs font-bold text-blue-600 mt-1 uppercase">
                        {classes.find(c => c.id === s.classId)?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 relative z-10">
                      <button 
                        onClick={() => editStudent(s.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Plus size={18} className="rotate-45" />
                      </button>
                      <button 
                        onClick={() => deleteStudent(s.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <Cake className="absolute -right-2 -bottom-2 text-pink-50 w-16 h-16 opacity-20" />
                  </div>
                )) : (
                  <div className="col-span-full py-12 text-center text-slate-400 italic">
                    Nenhum aniversariante registrado para este mês.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Custom Modal */}
      <AnimatePresence>
        {modal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b flex items-center justify-between">
                <h3 className="text-xl font-bold">{modal.title}</h3>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {modal.type === 'confirm' ? (
                  <p className="text-slate-600 leading-relaxed">{modal.message}</p>
                ) : modal.type === 'history' ? (
                  <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                    {modal.historyData && modal.historyData.length > 0 ? (
                      modal.historyData.map(record => (
                        <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="font-medium">
                              {format(parseISO(record.date), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold",
                            record.present ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                          )}>
                            {record.present ? 'Presente' : 'Faltou'}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-slate-400 py-8 italic">Nenhum registro de presença encontrado.</p>
                    )}
                  </div>
                ) : (
                  <form id="modal-form" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const data = Object.fromEntries(formData.entries());
                    modal.onConfirm(data);
                    closeModal();
                  }} className="space-y-4">
                    {modal.fields?.map(field => (
                      <div key={field.name} className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">{field.label}</label>
                        {field.type === 'select' ? (
                          <select 
                            name={field.name} 
                            defaultValue={field.defaultValue}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {field.options?.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input 
                            name={field.name}
                            type={field.type}
                            defaultValue={field.defaultValue}
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        )}
                      </div>
                    ))}
                  </form>
                )}
              </div>

              <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
                <button 
                  onClick={closeModal}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {modal.cancelText || 'Cancelar'}
                </button>
                <button 
                  form={modal.type === 'form' ? 'modal-form' : undefined}
                  onClick={modal.type !== 'form' ? () => { modal.onConfirm(); closeModal(); } : undefined}
                  className={cn(
                    "px-6 py-2 font-bold text-white rounded-xl transition-colors shadow-lg",
                    modal.confirmColor || 'bg-blue-600'
                  )}
                >
                  {modal.confirmText || 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="bg-white p-6 rounded-3xl border shadow-sm hover:shadow-md transition-all text-left group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-2xl text-white shadow-lg", color)}>
          <Icon size={24} />
        </div>
        <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
    </button>
  );
}

function QuickActionButton({ label, description, icon: Icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-4 p-5 bg-white rounded-3xl border shadow-sm hover:border-blue-200 hover:bg-blue-50/50 transition-all text-left group"
    >
      <div className="bg-slate-100 p-3 rounded-2xl text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <div>
        <p className="font-bold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}
