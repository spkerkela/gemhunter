Game = {
  // Ruudukkomainen taulukkorakenne helpottaa kartan generoimista
  map_grid: {
    width: 24,
    height: 16,
    tile: {
      width: 32,
      height: 32,
    },
  },

  width: function () {
    return this.map_grid.width * this.map_grid.tile.width;
  },

  height: function () {
    return this.map_grid.height * this.map_grid.tile.height;
  },

  // Pelin suoritus alkaa tästä
  start: function () {
    // Alustetaan pelimoottori
    Crafty.init(Game.width(), Game.height());
    // Taustakuva
    // Pelin ensimmäinen näyttöruutu on latausikkuna
    Crafty.scene("Loading");
  },
};

$text_css = {
  "font-size": "36px",
  "font-family": "Comic sans",
  color: "yellow",
  "text-align": "center",
};
