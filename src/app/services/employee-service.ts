import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee } from '../models/employee.model';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { signal } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private http: HttpClient = inject(HttpClient);
  private apiUrl: string = `${environment.apiUrl}/employees`;

  private allEmployees = signal<Employee[]>([]);
  private searchTerm = signal<string>('');
  private sortColumn = signal<string>('');
  private sortDirection = signal<'asc' | 'desc'>('asc');


  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl);
  }

  setEmployees(employees: Employee[]): void 
  {
    this.allEmployees.set(employees);
  }

  getSortColumn(): string 
  {
    return this.sortColumn();
  }

  getSortDirection(): 'asc' | 'desc' 
  {
    return this.sortDirection();
  }

  getFilteredAndSortedEmployees(): Employee[] {
    let result = [...this.allEmployees()];

    //Apply search filter
    const term = this.searchTerm().toLowerCase();

    result = result.filter((employee: Employee) => {
      return (employee.firstName.toLowerCase().includes(term) ||
        employee.lastName.toLowerCase().includes(term) ||
        employee.email.toLowerCase().includes(term) ||
        employee.department.toLowerCase().includes(term) ||
        employee.location.toLowerCase().includes(term));
    });
    //Apply sort

    result = this.applySort(result);
    return result;
  }

  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }

  setSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() == 'asc' ? 'desc' : 'asc');
    }
    else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  private applySort(employees: Employee[]): Employee[] {
    if (!this.sortColumn()) {
      return employees;
    }
    else {
      return employees.sort((a: Employee, b: Employee) => {
        const valueA = a[this.sortColumn() as keyof Employee];
        const valueB = b[this.sortColumn() as keyof Employee];

        let comparison = 0;
        if (valueA == null) return 1;
        if (valueB == null) return -1;


        if (typeof valueA === 'string' && typeof valueB === 'string') {
          comparison = valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }
        else if (typeof valueA === 'number' && typeof valueB === 'number') {
          comparison = valueA - valueB;
        }
        return this.sortDirection() === 'desc' ? comparison * -1 : comparison;
      });
    }
  }
}
