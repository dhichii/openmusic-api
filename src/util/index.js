/* eslint-disable camelcase */
const mapSongDBToModel = ({
  id, title, year, genre, performer, duration, album_id,
}) => ({
  id,
  title,
  year: parseInt(year),
  genre,
  performer,
  duration: parseInt(duration),
  albumId: album_id,
});

const mapAlbumDBToModel = ({
  id, name, year, cover,
}) => ({
  id,
  name,
  year: parseInt(year),
  coverUrl: cover,
});

module.exports = {mapSongDBToModel, mapAlbumDBToModel};
