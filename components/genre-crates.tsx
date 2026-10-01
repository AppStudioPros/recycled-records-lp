'use client';
import { useState } from 'react';
const genres = ['All Records', 'Rock', 'Jazz', 'Soul & Blues', 'Hip-Hop', 'Country & Folk'];
const cards = [
  { title: 'Late-night jazz', genre: 'Jazz', x: 43, y: 847 },
  { title: 'Rock essentials', genre: 'Rock', x: 311, y: 847 },
  { title: 'Soul discoveries', genre: 'Soul & Blues', x: 565, y: 847 },
  { title: 'Something unexpected', genre: 'Hip-Hop', x: 821, y: 847 },
];
export default function GenreCrates() {
  const [selected, setSelected] = useState('All Records');
  const displayed = selected === 'All Records' ? cards : cards.filter(card => card.genre === selected);
  return <>
    <div className="genre-tabs" aria-label="Browse music genres">
      {genres.map(genre => <button key={genre} type="button" aria-pressed={selected === genre} onClick={() => {
        setSelected(genre);
        window.dispatchEvent(new CustomEvent('recordshop:interaction', { detail: { event: 'genre_selected', genre } }));
      }}>{genre}</button>)}
    </div>
    <div className="record-grid" aria-live="polite" aria-atomic="true">
      {displayed.map(card => <article className="record" key={card.title}>
        <svg className="record-art" viewBox={`${card.x} ${card.y} 235 190`} aria-hidden="true">
          <image href="/images/approved-concept.png" width="1086" height="1448" />
        </svg>
        <h3>{card.title}</h3>
      </article>)}
      {!displayed.length && <div className="crate-note"><h3>Country roots. Folk favorites.</h3><p>Come browse the bins or call us about an artist you’re looking for.</p><a href="tel:+17202917000">Call 720-291-7000</a></div>}
    </div>
    <p className="caption">A little inspiration for your next dig. Artwork is illustrative; call or visit for current stock.</p>
  </>;
}
