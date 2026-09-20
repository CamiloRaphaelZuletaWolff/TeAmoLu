import { useState } from "react";
import { Music2, Play, ExternalLink, Heart } from "lucide-react";
import { spotifyEmbed, musicUrl } from "../lib/fechas";
import { Reveal, SectionTitle, EditActions, Empty } from "./UI";
export function Playlist({ items, session, edit, remove }) {
  const [playing, setPlaying] = useState(null);
  return (
    <section className="section" id="playlist">
      <SectionTitle
        number="04"
        title="Lo nuestro también suena"
        subtitle="Canciones que, desde que llegaste, tienen tu nombre."
      />
      <div className="playlist-layout">
        <Reveal className="playlist-art">
          <div className="record">
            <div className="record-label">
              <Heart size={32} />
              <span>TÚ & YO</span>
            </div>
          </div>
          <h3>
            La banda sonora
            <br />
            <em>de nosotros.</em>
          </h3>
          <span className="eyebrow">PARA ESCUCHAR CERQUITA</span>
        </Reveal>
        <div className="song-list">
          {items.length ? (
            items.map((item, index) => (
              <Reveal className="song" key={item.id} delay={(index % 4) * 0.08}>
                <div className="song-row">
                  <span className="song-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="song-content">
                    <h3>{item.titulo}</h3>
                    <span>{item.artista}</span>
                    <p>{item.nota}</p>
                  </div>
                  {musicUrl(item.url) && (
                    <a
                      className="icon-button"
                      href={musicUrl(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Escuchar ${item.titulo} en otra pestaña`}
                    >
                      <ExternalLink size={18} />
                    </a>
                  )}
                  {spotifyEmbed(item.url) && (
                    <button
                      className="icon-button"
                      aria-label={`Mostrar reproductor de ${item.titulo}`}
                      aria-expanded={playing === item.id}
                      onClick={() =>
                        setPlaying(playing === item.id ? null : item.id)
                      }
                    >
                      <Play size={18} />
                    </button>
                  )}
                  {!item.url && <Music2 size={20} />}
                </div>
                {playing === item.id && spotifyEmbed(item.url) && (
                  <iframe
                    className="spotify-player"
                    title={`Spotify: ${item.titulo}`}
                    src={spotifyEmbed(item.url)}
                    height="152"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                )}
                {session && (
                  <EditActions
                    label={item.titulo}
                    onEdit={() => edit("canciones", item)}
                    onDelete={() => remove("canciones", item)}
                  />
                )}
              </Reveal>
            ))
          ) : (
            <Empty>Nuestra próxima canción favorita nos está esperando.</Empty>
          )}
        </div>
      </div>
    </section>
  );
}
