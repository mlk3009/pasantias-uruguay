import { Component, AfterViewInit, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { global } from '../../../services/global';
import { UserService } from '../../../services/user.service';
import ApexCharts from 'apexcharts';

interface ActiveUsersStats {
  daily_stats: Array<{
    date: string;
    day_name?: string;
    active_users: number;
  }>;
  total_active_week: number;
  period: string;
}

interface ApiResponse {
  status: string;
  data: ActiveUsersStats;
}

@Component({
  selector: 'app-grafica-estudiantes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafica-estudiantes.component.html',
  styleUrl: './grafica-estudiantes.component.css'
})
export class GraficaEstudiantesComponent implements AfterViewInit, OnInit {
  
  private chart: ApexCharts | null = null;
  activeUsersData: ActiveUsersStats | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(private http: HttpClient, private userService: UserService) {}

  ngOnInit(): void {
    this.loadActiveUsersData();
  }

  ngAfterViewInit(): void {
    // Se renderizará después de cargar los datos
  }

  private loadActiveUsersData(): void {
    const token = this.userService.getToken();
    
    if (!token) {
      this.error = 'No se registró actividad de estudiantes (sin autenticación)';
      this.isLoading = false;
      this.renderChart();
      return;
    }
    
    this.http.get<ApiResponse>(`${global.url}users/active-stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.activeUsersData = response.data;
          this.error = null;
          this.renderChart();
        } else {
          this.error = 'Error al cargar datos de usuarios activos';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        this.error = 'No se registró actividad de estudiantes en los últimos 7 días';
        this.isLoading = false;
        // Renderizar con datos por defecto en caso de error
        this.renderChart();
      }
    });
  }

  private renderChart(): void {
    // Usar datos reales si están disponibles, sino datos por defecto
    let chartData;
    
    if (this.activeUsersData?.daily_stats) {
      // Formatear las fechas del backend (YYYY-MM-DD a DD/MM)
      chartData = this.activeUsersData.daily_stats.map(item => ({
        date: this.formatDate(item.date),
        active_users: item.active_users
      }));
    } else {
      // Datos por defecto si no hay datos reales
      chartData = [
        { date: '25/06', active_users: 0 },
        { date: '26/06', active_users: 0 },
        { date: '27/06', active_users: 0 },
        { date: '28/06', active_users: 0 },
        { date: '29/06', active_users: 0 },
        { date: '30/06', active_users: 0 },
        { date: '01/07', active_users: 0 }
      ];
    }

    const categories = chartData.map(item => item.date);
    const data = chartData.map(item => item.active_users);

    const options = {
      chart: {
        height: "100%",
        maxWidth: "100%",
        type: "area",
        fontFamily: "Inter, sans-serif",
        dropShadow: {
          enabled: false,
        },
        toolbar: {
          show: false,
        },
      },
      tooltip: {
        enabled: true,
        x: {
          show: false,
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.55,
          opacityTo: 0,
          shade: "#1C64F2",
          gradientToColors: ["#1C64F2"],
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        width: 6,
      },
      grid: {
        show: false,
        strokeDashArray: 4,
        padding: {
          left: 2,
          right: 2,
          top: 0,
        },
      },
      series: [
        {
          name: "Usuarios activos",
          data: data,
          color: "#1A56DB",
        },
      ],
      xaxis: {
        categories: categories,
        labels: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        show: false,
      },
    };

    const areaChartElement = document.getElementById("area-chart");
    if (areaChartElement && typeof ApexCharts !== "undefined") {
      // Destruir gráfico anterior si existe
      if (this.chart) {
        this.chart.destroy();
      }
      
      this.chart = new ApexCharts(areaChartElement, options);
      this.chart.render();
    }
  }

  private formatDate(dateString: string): string {
    // Convertir de YYYY-MM-DD a DD/MM
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  }

  getTotalActiveUsers(): number {
    return this.activeUsersData?.total_active_week || 0;
  }
}