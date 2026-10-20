import { useState } from 'react';
import { Link } from 'react-router-dom';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FAQ_LINKS = [
  { label: 'Shipping and returns', to: '/shipping' },
  { label: 'Order history', to: '/orders' },
  { label: 'Warranty', to: '/warranty' },
  { label: 'Terms of service', to: '/terms' },
  { label: 'Privacy policy', to: '/privacy' }
];

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/',
    paths: ['M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z', 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z', 'M17.5 6.5h.01']
  },
  {
    label: 'X',
    href: 'https://x.com/',
    paths: ['M4 4l11.733 16h4.267l-11.733-16z', 'M4 20l6.768-6.768m2.46-2.46l6.772-6.772']
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/',
    paths: ['M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z']
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/',
    paths: ['M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z', 'M2 9h4v12H2z', 'M4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z']
  }
];

function Icon({ paths }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map(d => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

export default function Footer({ onSubscribe }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const handleSubmit = async event => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL_PATTERN.test(value)) {
      setStatus({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }
    try {
      if (onSubscribe) await onSubscribe(value);
      setStatus({ type: 'success', message: 'You’re on the list. Watch your inbox for the next drop.' });
      setEmail('');
    } catch {
      setStatus({ type: 'error', message: 'We couldn’t subscribe you. Try again in a moment.' });
    }
  };

  return (
    <footer className="sf-footer">
      <span className="sf-blob sf-blob-a" aria-hidden="true" />
      <span className="sf-blob sf-blob-b" aria-hidden="true" />
      <span className="sf-blob sf-blob-c" aria-hidden="true" />
      <span className="sf-blob sf-blob-d" aria-hidden="true" />

      <div className="sf-strip">
        <div className="sf-strip-inner">
          <nav className="sf-col" aria-label="Help and legal">
            <h3>FAQ</h3>
            <ul>
              {FAQ_LINKS.map(link => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="sf-col">
            <h3 id="newsletter-title">Newsletter</h3>
            <form className="sf-news" onSubmit={handleSubmit} noValidate aria-labelledby="newsletter-title">
              <label className="visually-hidden" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Your email address"
                value={email}
                onChange={event => setEmail(event.target.value)}
                aria-invalid={status.type === 'error'}
                aria-describedby="newsletter-status"
              />
              <button type="submit">Subscribe</button>
              <p id="newsletter-status" className="sf-news-status" data-type={status.type} role="status">
                {status.message}
              </p>
            </form>
          </div>

          <div className="sf-col">
            <h3>General information</h3>
            <a className="sf-phone" href="tel:+15550100199">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              +1 (555) 010-0199
            </a>
            <address>
              1200 Nimbus Way
              <br />
              Austin, TX 78701, USA
            </address>
            <ul className="sf-socials">
              {SOCIALS.map(social => (
                <li key={social.label}>
                  <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                    <Icon paths={social.paths} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <p className="sf-legal">© 2026 Aurora Store. All rights reserved.</p>
    </footer>
  );
}
