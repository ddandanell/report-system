/**
 * Demo-mode database adapter — returns hardcoded demo data for all queries.
 * Pattern-matches SQL to return realistic data. No real database needed.
 */
import {
  DEMO_USERS, DEMO_STUDENTS, DEMO_ASSIGNMENTS, DEMO_PARENT_STUDENTS,
  DEMO_QUESTIONS, DEMO_REPORTS, getDemoAnswers, DEMO_SETTINGS,
} from './demo-data';

type Row = Record<string, any>;

function matchQuery(_sql: string, _params: any[]): Row[] {
  const s = _sql.replace(/\s+/g, ' ').toLowerCase().trim();

  // ── Auth ──
  if (s.includes('select * from users where username') && s.includes('limit 1')) {
    const username = _params[0];
    const users = Object.values(DEMO_USERS);
    const user = users.find(u => u.username === username);
    return user ? [{ ...user, password_hash: '$2a$10$dummyhash' }] : [];
  }
  if (s.includes('select * from users where invite_token')) {
    const token = _params[0];
    const users = Object.values(DEMO_USERS);
    const user = users.find((u: any) => u.invite_token === token);
    return user ? [user] : [];
  }

  // ── Users queries ──
  if (s.includes('select') && s.includes('from users') && s.includes("role = 'teacher'")) {
    return [DEMO_USERS.teacher1, DEMO_USERS.teacher2].map(t => ({ ...t }));
  }
  if (s.includes('select') && s.includes('from users') && s.includes("role = 'parent'")) {
    return [DEMO_USERS.parent1, DEMO_USERS.parent2].map(p => ({ ...p }));
  }
  if (s.includes('select') && s.includes('from users') && s.includes('where id =')) {
    const id = _params[0];
    const users = Object.values(DEMO_USERS);
    const user = users.find(u => u.id === Number(id));
    return user ? [user] : [];
  }
  if (s.includes('insert into users')) {
    const { id: _, ...rest } = DEMO_USERS.admin;
    return [{ id: 99, ...rest }];
  }
  if (s.includes('update users') && s.includes('password_hash')) {
    return [];
  }
  if (s.includes('delete from users')) {
    return [];
  }

  // ── Students ──
  if (s.includes('select') && s.includes('from students') && s.includes('order by name')) {
    return [...DEMO_STUDENTS].sort((a, b) => a.name.localeCompare(b.name));
  }
  if (s.includes('select') && s.includes('from students') && s.includes('where id =')) {
    const id = _params[0];
    return DEMO_STUDENTS.filter(s => s.id === Number(id));
  }
  if (s.includes('insert into students')) {
    const { id: _, ...rest } = DEMO_STUDENTS[0] as any;
    return [{ id: 99, ...rest }];
  }
  if (s.includes('update students')) {
    return [DEMO_STUDENTS[0]];
  }
  if (s.includes('delete from students')) {
    return [];
  }
  if (s.includes('select') && s.includes('from students') && s.includes('join assignments')) {
    // Teacher's students query
    const teacherId = _params[0] || DEMO_USERS.teacher1.id;
    const assignments = DEMO_ASSIGNMENTS.filter(a => a.teacher_id === teacherId);
    const studentIds = assignments.map(a => a.student_id);
    return DEMO_STUDENTS.filter(s => studentIds.includes(s.id)).map(s => {
      const a = assignments.find(x => x.student_id === s.id)!;
      return { ...s, subject: a.subject, sessions_per_week: a.sessions_per_week };
    });
  }

  // ── Questions ──
  if (s.includes('select') && s.includes('from questions')) {
    if (s.includes('active = 1') || s.includes('active = true')) {
      return DEMO_QUESTIONS.filter(q => q.active);
    }
    return [...DEMO_QUESTIONS].sort((a, b) => a.sort_order - b.sort_order);
  }
  if (s.includes('insert into questions')) {
    const { id: _, ...rest } = DEMO_QUESTIONS[0] as any;
    return [{ id: 99, ...rest }];
  }
  if (s.includes('update questions')) {
    return [DEMO_QUESTIONS[0]];
  }
  if (s.includes('delete from questions')) {
    return [];
  }

  // ── Settings ──
  if (s.includes('from settings')) {
    if (s.includes('insert') && s.includes('on conflict')) {
      return [];
    }
    return Object.entries(DEMO_SETTINGS).map(([key, value]) => ({ key, value }));
  }

  // ── Assignments ──
  if (s.includes('from assignments') || s.includes('insert into assignments')) {
    return DEMO_ASSIGNMENTS;
  }
  if (s.includes('update assignments')) {
    return [];
  }

  // ── Parent-Students ──
  if (s.includes('from parent_students')) {
    if (s.includes('where parent_id')) {
      const parentId = _params[0] || DEMO_USERS.parent1.id;
      return DEMO_PARENT_STUDENTS.filter(ps => ps.parent_id === parentId);
    }
    if (s.includes('where') && s.includes('student_id')) {
      const studentId = _params[0];
      return DEMO_PARENT_STUDENTS.filter(ps => ps.student_id === Number(studentId));
    }
    return DEMO_PARENT_STUDENTS;
  }

  // ── Reports ──
  if (s.includes('from reports')) {
    if (s.includes('where r.id =')) {
      const reportId = Number(_params[0]);
      const report = DEMO_REPORTS.find(r => r.id === reportId);
      if (!report) return [];
      const student = DEMO_STUDENTS.find(s => s.id === report.student_id)!;
      const teacher = Object.values(DEMO_USERS).find(u => u.id === report.teacher_id)!;
      return [{
        ...report,
        student_name: student.name,
        student_age: student.age,
        student_grade: student.grade,
        student_subject: student.subject,
        teacher_name: teacher.name,
      }];
    }

    let filtered = [...DEMO_REPORTS];

    // Filter by student_id
    if (s.includes('r.student_id')) {
      const sidIdx = _params.findIndex((_: any, i: number) =>
        s.includes('r.student_id') && (s.indexOf('?') !== s.lastIndexOf('?')) &&
        _params[i - 1] === undefined // rough heuristic
      );
      // Simpler: just use all reports
    }

    // Filter by week_start
    for (const param of _params) {
      if (typeof param === 'string' && param.match(/^\d{4}-\d{2}-\d{2}$/)) {
        filtered = filtered.filter(r => r.week_start === param || r.session_date === param);
      }
      if (typeof param === 'number' && !isNaN(param)) {
        filtered = filtered.filter(r => r.student_id === Number(param));
      }
    }

    // Filter by teacher
    if (s.includes('teacher_id')) {
      for (const param of _params) {
        if (typeof param === 'number') {
          filtered = filtered.filter(r => r.teacher_id === Number(param));
        }
      }
    }

    // Attach names
    return filtered.sort((a, b) => b.session_date.localeCompare(a.session_date)).map(r => {
      const student = DEMO_STUDENTS.find(s => s.id === r.student_id)!;
      const teacher = Object.values(DEMO_USERS).find(u => u.id === r.teacher_id)!;
      return { ...r, student_name: student.name, teacher_name: teacher.name };
    });
  }

  // ── Report answers ──
  if (s.includes('from report_answers')) {
    const reportId = _params[0];
    const answers = getDemoAnswers(Number(reportId));
    return answers.map(a => {
      const q = DEMO_QUESTIONS.find(q => q.id === a.question_id)!;
      return { ...a, question: q.text, type: q.type, category: q.category, sort_order: q.sort_order };
    });
  }

  // ── Count queries ──
  if (s.includes('count(*)')) {
    return [{ count: 5 }];
  }

  // ── Parent children queries ──
  if (s.includes('join parent_students') && s.includes('join students')) {
    const parentId = _params[0] || DEMO_USERS.parent1.id;
    const links = DEMO_PARENT_STUDENTS.filter(ps => ps.parent_id === parentId);
    const result = links.map(link => {
      const student = DEMO_STUDENTS.find(s => s.id === link.student_id)!;
      const assignment = DEMO_ASSIGNMENTS.find(a => a.student_id === link.student_id);
      const teacher = assignment ? Object.values(DEMO_USERS).find(u => u.id === assignment.teacher_id) : null;
      return { ...student, teacher_name: teacher?.name || null };
    });
    return result;
  }

  // ── Parent reports queries ──
  if (s.includes('from reports') && s.includes('join parent_students')) {
    const parentId = _params[0] || DEMO_USERS.parent1.id;
    const links = DEMO_PARENT_STUDENTS.filter(ps => ps.parent_id === parentId);
    const studentIds = links.map(l => l.student_id);
    const filtered = DEMO_REPORTS.filter(r => studentIds.includes(r.student_id));
    return filtered.sort((a, b) => b.session_date.localeCompare(a.session_date)).map(r => {
      const student = DEMO_STUDENTS.find(s => s.id === r.student_id)!;
      return { id: r.id, session_date: r.session_date, topic: r.topic, child_name: student.name };
    });
  }

  // ── Settings GET / PUT ──
  if (s.includes('from settings') && s.includes('order by key')) {
    return Object.entries(DEMO_SETTINGS).map(([key, value]) => ({ key, value }));
  }

  // Fallback
  return [];
}

export function demoSql(strings: TemplateStringsArray, ...values: any[]): Promise<Row[]> {
  const sqlStr = strings.join('?');
  return Promise.resolve(matchQuery(sqlStr, values));
}
