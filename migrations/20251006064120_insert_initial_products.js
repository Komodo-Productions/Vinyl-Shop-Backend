exports.up = function(knex) {
  return knex('product').insert([
    {
      name: 'Nevermind',
      artist: 'Nirvana',
      price: 27.99,
      genre_id: 1,
      publication_date: '1991-09-24',
      description: 'Grunge revolution that defined the 90s'
    },
    {
      name: '21',
      artist: 'Adele',
      price: 25.50,
      genre_id: 2,
      publication_date: '2011-01-24',
      description: 'Emotional pop ballads with record-breaking sales'
    },
    {
      name: 'Illmatic',
      artist: 'Nas',
      price: 29.99,
      genre_id: 3,
      publication_date: '1994-04-19',
      description: 'Hip-hop classic with poetic storytelling'
    },
    {
      name: 'Blue Train',
      artist: 'John Coltrane',
      price: 24.75,
      genre_id: 4,
      publication_date: '1957-09-15',
      description: 'Essential hard bop jazz album'
    },
    {
      name: 'The Wall',
      artist: 'Pink Floyd',
      price: 33.99,
      genre_id: 1,
      publication_date: '1979-11-30',
      description: 'Progressive rock opera with iconic tracks'
    },
    {
      name: 'Born to Die',
      artist: 'Lana Del Rey',
      price: 28.25,
      genre_id: 2,
      publication_date: '2012-01-27',
      description: 'Melancholic pop with cinematic production'
    }
  ]);
};

exports.down = function(knex) {
  return knex('product').whereIn('name', [
    'Nevermind',
    '21',
    'Illmatic', 
    'Blue Train',
    'The Wall',
    'Born to Die'
  ]).del();
};
