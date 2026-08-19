import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <div class="footer-content">
        <span class="footer-brand">Cooperativa Ecuador &copy; {{ year }}</span>
        <span class="footer-dev">
          Desarrollado por
          <a href="https://jeffersonmejia.github.io/portfolio-app/" target="_blank" rel="noopener">
            Jefferson
          </a>
        </span>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #ffffff;
      border-top: 1px solid #e0e0e0;
      padding: 12px 32px;
      z-index: 999;
    }

    .footer-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1200px;
      margin: 0 auto;
      font-size: 13px;
      color: #666;
    }

    .footer-brand {
      font-weight: 500;
      color: #2e7d32;
    }

    .footer-dev a {
      color: #2e7d32;
      text-decoration: none;
      font-weight: 500;
    }

    .footer-dev a:hover {
      text-decoration: underline;
    }
  `,
})
export class FooterComponent {
  year = new Date().getFullYear();
}
