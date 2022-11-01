var score = 0;
var level = 0;
var levelBackgrounds = [
  "grass-background-1",
  "grass-background-2",
  "lava-background-1",
  "lava-background-2",
  "lava-background-3",
  "lava-background-4",
].map(function (imageName) {
  return `url(assets/${imageName}.png)`;
});
Crafty.scene(
  "Game",
  function () {
    // taulukko joka kertoo onko ruudussa jotain, eli onko se "blocked"

    Crafty.background(levelBackgrounds[level % levelBackgrounds.length]);
    this.occupied = new Array(Game.map_grid.width);
    for (var i = 0; i < Game.map_grid.width; i++) {
      this.occupied[i] = new Array(Game.map_grid.height);
      for (var y = 0; y < Game.map_grid.height; y++) {
        this.occupied[i][y] = false;
      }
    }

    var player = Crafty.e("PlayerCharacter").at(1, 1);
    this.occupied[player.at().x][player.at().y] = true;

    // lisätään peliin puut ja pensaat
    for (var x = 0; x < Game.map_grid.width; x++) {
      for (var y = 0; y < Game.map_grid.height; y++) {
        // onko kyseinen koordinaatti peliauleen reunalla?
        var at_edge =
          x == 0 ||
          x == Game.map_grid.width - 1 ||
          y == 0 ||
          y == Game.map_grid.height - 1;

        if (at_edge && !this.occupied[x][y]) {
          // reunoille puut
          Crafty.e("Tree").at(x, y);
          this.occupied[x][y] = true;
        } else if (Math.random() < 0.06 && !this.occupied[x][y]) {
          Crafty.e("Bush").at(x, y);
          this.occupied[x][y] = true;
        }
      }
    }
    // satunnainen määrä timangeja, nousee levelien mukana
    var max_gems = 5 + level;
    for (var x = 0; x < Game.map_grid.width; x++) {
      for (var y = 0; y < Game.map_grid.height; y++) {
        if (Math.random() < 0.03) {
          if (Crafty("Gem").length < max_gems && !this.occupied[x][y]) {
            Crafty.e("Gem").at(x, y);
          }
        }
      }
    }
    // myös monsterien määrä kasvaa levujen mukana
    var max_monsters = 5 + level;
    for (var x = 0; x < Game.map_grid.width; x++) {
      for (var y = 0; y < Game.map_grid.height; y++) {
        if (Math.random() < 0.03) {
          if (Crafty("Monster").length < max_gems && !this.occupied[x][y]) {
            Crafty.e("Monster").at(x, y);
          }
        }
      }
    }

    // sidotaan 'GemVisited' eventti anonyymiin funktioon, joka nostaa scorea
    // ja päivittää UI:ta. jos kaikki gemit kerätty, levu päättyy voittoon
    this.show_victory = this.bind("GemVisited", function () {
      score++;
      $("#score").html("Current score: " + score);
      if (!Crafty("Gem").length) {
        Crafty.scene("Victory");
      }
    });

    // sidotaan 'PlayerHitMonster' eventti anonyymiin funktioon joka tiputtaa
    // pelaajan elämiä, päivittää UI jne
    this.show_defeat = this.bind("PlayerHitMonster", function () {
      player.lives--;
      Crafty.audio.play("hurt");
      $("#lives").html("Current lives: " + player.lives);

      if (player.lives <= 0) {
        Crafty.scene("Defeat");
      }
    });
  },
  function () {
    // unbindataan eventtikuuntelijat etteivät niitä keräänny turhaan useiden levujen kuluessa
    this.unbind("GemVisited", this.show_victory);
    this.unbind("PlayerHitMonster", this.show_defeat);
  }
);

// Voittoruutu, näyttää voitetun tason ja scoren
Crafty.scene(
  "Victory",
  function () {
    Crafty.e("2D, DOM, Text")
      .attr({ x: 0, y: Game.height() / 2 - 24, w: Game.width() })
      .text("Level " + (level + 1) + " cleared! Current score: " + score)
      .css($text_css);
    this.restart_game = this.bind("KeyDown", function () {
      level++;
      $("#lvl").html("Level: " + (level + 1));
      Crafty.scene("Game");
    });
  },
  function () {
    // unbindataan eventtikuuntelijat etteivät niitä keräänny turhaan useiden levujen kuluessa
    this.unbind("KeyDown", this.restart_game);
  }
);

// Häviöruutu, kertoo kuinka pitkälle pelaaja pääsi
Crafty.scene(
  "Defeat",
  function () {
    Crafty.e("2D, DOM, Text")
      .attr({ x: 0, y: Game.height() / 2 - 24, w: Game.width() })
      .text(
        "Defeat! You reached level " +
          (level + 1) +
          " and scored " +
          score +
          "!"
      )
      .css($text_css);

    // Napinpainalluksella peli alkaa alusta
    this.restart_game = this.bind("KeyDown", function () {
      score = 0;
      level = 0;
      // jqueryä tähän väliin
      $("#lvl").html("Level: " + (level + 1));
      $("#lives").html("Current lives: 3");
      $("#score").html("Current score: " + score);
      Crafty.scene("Game");
    });
  },
  function () {
    // unbindataan eventtikuuntelijat etteivät niitä keräänny turhaan useiden levujen kuluessa
    this.unbind("KeyDown", this.restart_game);
  }
);

// Latauscreeni, joka näkyy kun peli latautuu (ideaalitapauksessa ei koskaan kerkeä näkymään ruudulla)
Crafty.scene("Loading", function () {
  Crafty.e("2D, DOM, Text")
    .text("Loading...")
    .attr({ x: 0, y: Game.height() / 2 - 24, w: Game.width() })
    .css($text_css);

  // Ladataan crafty engineen kaikki assetit
  var assetsObj = {
    audio: {
      hurt: ["assets/hurt.ogg"],
      gem: ["assets/coin1.ogg"],
      background: ["assets/timantti.ogg"],
    },
    sprites: {
      "assets/tileset.png": {
        tile: 32,
        tileh: 32,
        map: {
          spr_tree: [0, 0],
          spr_bush: [1, 0],
          spr_gem: [0, 1],
          spr_monster: [1, 1],
        },
      },
      "assets/hero.png": {
        tile: 32,
        tileh: 32,
        map: {
          spr_player: [0, 0],
        },
      },
    },
  };
  Crafty.load(assetsObj, function () {
    Crafty.audio.play("background", -1);
    Crafty.scene("Game");
  });
});
