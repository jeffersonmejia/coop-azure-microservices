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
      padding: 12px 24px;
      z-index: 999;
      text-align: center;
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      font-family: var(--coop-font);
      font-size: 13px;
      color: var(--coop-text-muted);
    }

    .footer-brand {
      font-weight: 500;
      color: var(--coop-text-muted);
    }

    .footer-dev a {
      color: var(--coop-green-800);
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
