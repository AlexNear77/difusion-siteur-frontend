import { useCallback, useEffect, useMemo, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './App.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const POLLING_MS = 30000;

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif']);
const PDF_EXTENSION = 'pdf';

function buildUrl(relativeUrl) {
  if (!API_BASE) return relativeUrl;
  return `${API_BASE}${relativeUrl}`;
}

function getExtension(fileName = '') {
  const cleanName = fileName.split('?')[0].split('#')[0];
  const ext = cleanName.includes('.') ? cleanName.split('.').pop() : '';
  return (ext || '').toLowerCase();
}

function buildPdfViewerUrl(url) {
  const separator = url.includes('#') ? '&' : '#';
  return `${url}${separator}view=FitH&page=1&navpanes=0&toolbar=0&statusbar=0&messages=0`;
}

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMedia = useCallback(async () => {
    try {
      const response = await fetch(buildUrl('/api/media'));
      if (!response.ok) throw new Error('No se pudo consultar la API');
      const data = await response.json();
      setItems(data.items || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Ocurrió un error al consultar medios.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMedia();
    const interval = setInterval(fetchMedia, POLLING_MS);
    return () => clearInterval(interval);
  }, [fetchMedia]);

  const empty = useMemo(() => !loading && items.length === 0 && !error, [loading, items.length, error]);

  const renderMedia = useCallback((item) => {
    const mediaUrl = buildUrl(item.url);
    const extension = getExtension(item.name || item.url);
    const isImage = item.type === 'image' || IMAGE_EXTENSIONS.has(extension);
    const isPdf = item.type === 'pdf' || extension === PDF_EXTENSION;

    if (isImage) {
      return <img src={mediaUrl} alt={item.name} className="media-image" loading="lazy" />;
    }

    if (isPdf) {
      return (
        <iframe
          src={buildPdfViewerUrl(mediaUrl)}
          title={item.name}
          className="media-embed"
          loading="lazy"
        />
      );
    }

    return (
      <object data={mediaUrl} className="media-embed" aria-label={item.name}>
        <div className="unsupported-file">
          <strong>Vista previa no disponible para este archivo.</strong>
          <span>{item.name}</span>
        </div>
      </object>
    );
  }, []);

  return (
    <main className="app-shell">
      <header className="site-header">
        <div className="top-strip container">
          <nav className="top-links" aria-label="Enlaces superiores">
            <a href="https://www.siteur.gob.mx/" className="top-link-item">
              <img src="/imagenes/icon-home.png" alt="" aria-hidden="true" className="top-link-icon" />
              <span>Inicio</span>
            </a>
            <a href="https://www.siteur.gob.mx/index.php/contacto" className="top-link-item">
              <img src="/imagenes/icon-contacto.png" alt="" aria-hidden="true" className="top-link-icon" />
              <span>Contacto</span>
            </a>
            <a href="https://www.siteur.gob.mx/index.php/aviso-de-privacidad" className="top-link-item">Aviso de Privacidad</a>
          </nav>
          <p className="top-contact"><strong>Contáctanos:</strong> (33) 3942 5700</p>
        </div>

        <div className="main-nav container">
          <a className="brand" href="https://www.siteur.gob.mx/" aria-label="Ir a SITEUR">
            <img src="/imagenes/logo.png" alt="SITEUR" className="brand-logo" />
          </a>

          <nav className="primary-nav" aria-label="Navegación principal">
            <a href="https://www.siteur.gob.mx/index.php/quienes-somos">Quiénes Somos</a>
            <a href="https://www.siteur.gob.mx/index.php/sistemas-de-transporte">Sistemas de Transporte</a>
            <a href="https://www.siteur.gob.mx/index.php/forma-de-pago">Forma de Pago</a>
            <a href="https://www.siteur.gob.mx/index.php/reglamento">Reglamentos</a>
            <a href="https://www.siteur.gob.mx/index.php/cultura">Cultura</a>
            <a href="https://www.siteur.gob.mx/index.php/noticias">Noticias</a>
            <a href="https://www.siteur.gob.mx/index.php/transparencia">Transparencia</a>
            <a href="https://www.siteur.gob.mx/index.php/licitaciones">Licitaciones</a>
          </nav>
        </div>
      </header>

      <section className="carousel-section container">
        {loading && <div className="status">Cargando contenido...</div>}
        {error && <div className="status error">{error}</div>}
        {empty && <div className="status">No hay archivos para mostrar.</div>}

        {!loading && !error && items.length > 0 && (
          <Swiper
            modules={[Navigation, Pagination, Keyboard, Autoplay]}
            navigation
            pagination={{ clickable: true }}
            keyboard
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            spaceBetween={20}
            slidesPerView={1}
            className="media-swiper"
          >
            {items.map((item) => (
              <SwiperSlide key={`${item.name}-${item.updatedAt}`}>
                <article className="slide-card">
                  <div className="media-container">
                    {renderMedia(item)}
                  </div>

                  <footer className="slide-footer">
                    <span className="file-name" title="ALERTA NACIONALNAL">ALERTA NACIONAL</span>
                    <small>{new Date(item.updatedAt).toLocaleString('es-MX')}</small>
                  </footer>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </section>

      <footer className="site-footer">
        <div className="footer-links container">
          <a href="https://www.siteur.gob.mx/files/transparencia/2025/aviso_de_privacidad__del_sistema_de_tren_electrico_urbano_(siteur)_version_integral..docx.pdf">AVISO DE PRIVACIDAD SITEUR</a>
          <a href="https://www.siteur.gob.mx/files/transparencia/2025/aviso_de_privacidad_gerencia_de__recursos_humanos..docx_(3).pdf">AVISO DE PRIVACIDAD DE LA GERENCIA DE RECURSOS HUMANOS</a>
          <a href="https://www.siteur.gob.mx/files/aviso_de_privacidad_de_la_gerencia_de_recursos_materiales_2025.docx.pdf">AVISO DE PRIVACIDAD DE LA GERENCIA DE RECURSOS MATERIALES</a>
          <a href="https://www.siteur.gob.mx/files/aviso_de_privacidad_de_la_gerencia_de_recursos_materiales_simplificado_2025.docx.pdf">AVISO DE PRIVACIDAD DE LA GERENCIA DE RECURSOS MATERIALES SIMPLIFICADO</a>
        </div>

        <div className="footer-contact container">
          <p><strong>Teléfono:</strong> (33)3942-5700</p>
          <p><strong>Oficinas centrales:</strong> AV. Federalismo Sur No. 217. CP 44100, Guadalajara, Jalisco México.</p>
        </div>

        <div className="footer-social container" aria-label="Redes sociales">
          <h3>@SITEURJAL</h3>
          <div className="social-icons">
            <a href="https://www.facebook.com/SITEURJAL" aria-label="Facebook">f</a>
            <a href="https://twitter.com/SITEURJAL" aria-label="X">X</a>
            <a href="https://www.tiktok.com/@siteurjal" aria-label="TikTok">♪</a>
            <a href="https://t.me/SITEURJAL" aria-label="Telegram">➤</a>
            <a href="https://www.instagram.com/siteurjal" aria-label="Instagram">◎</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
