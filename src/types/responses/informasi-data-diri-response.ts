interface Employee {
    birth_place: string;
    birth_date: string;
    contact: string;
    address: string;
    married_status: string;
    blood_type: string;
    religion: string;
    last_education: string;
  }
  
  interface Work {
    entry_date: string;
    group: string;
    dependent_children: string;
    office: string;
    position: string;
    department: string;
    subdepartment: string;
    year_work_period: string;
    month_work_period: string;
    year_work_group: string;
    month_work_group: string;
  }
  
  interface InformasiDataDiriResponse {
    employee: Employee;
    work: Work;
  }