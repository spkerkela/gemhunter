/* Sisältää kaikki pelissä käytettävät komponentit */

// Grid komponentti on kaikilla pelientityillä jotka liikkuvat ruudulla
Crafty.c("Grid", {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    });
  },
  at: function(x, y) {
    if (x === undefined && y == undefined) {
      return {
        x: this.x / Game.map_grid.tile.width,
        y: this.y / Game.map_grid.tile.height
      };
    } else {
      this.attr({
        x: x * Game.map_grid.tile.width,
        y: y * Game.map_grid.tile.height
      });
      return this;
    }
  }
});

// Tyypillinen actor komponentti, joka sisältää kaikille yhteisiä juttuja
Crafty.c("Actor", {
  required: "2D, Canvas, Grid",
  init: function() {}
});

// Puut ja pensaat ovat molemmat 'solid', eli niiden läpi ei pääse
Crafty.c("Tree", {
  required: "Actor, Solid, spr_tree",
  init: function() {}
});

Crafty.c("Bush", {
  required: "Actor, Solid, spr_bush",
  init: function() {}
});

// Pelaajakomponentti
Crafty.c("PlayerCharacter", {
  required: "Actor, Fourway, Collision, spr_player",
  init: function() {
    this.fourway(200) // Fourway on Crafty pelimoottorin liikkumiskomponentti
      .onHit("Solid", this.stopMovement) // pysähtyy 'Solid' komponentin omaaviin entityihin
      .onHit("Gem", this.visitGem) // callbackeja törmätessä timantteihin ja vihuihin
      .onHit("Monster", this.hitByMonster);
    this.attr({
      lives: 3
    });

    $("#lives").html("Current lives: " + this.lives);
  },

  stopOnSolids: function() {
    this.onHit("Solid", this.stopMovement); // kiinteään esteeseen osuessa pysähdytään
    return this;
  },

  stopMovement: function() {
    this.x -= this.dx;
    this.y -= this.dy;
  },

  // törmätessä timanttiin, otetaan kyseinen timantti muuttujaan ja kerätään se
  visitGem: function(data) {
    gem = data[0].obj;
    gem.collect();
  },

  // siirretään pelaaja aloituskohtaan ja lähetetään 'PlayerHitMonster' eventti
  hitByMonster: function() {
    this.x = 1 * Game.map_grid.tile.width;
    this.y = 1 * Game.map_grid.tile.height;
    Crafty.trigger("PlayerHitMonster", this);
  }
});

// Pelin tavoite-esineet
Crafty.c("Gem", {
  required: "Actor, spr_gem",
  init: function() {},

  // Kun pelaaja saapuu timantin luo, soitellaan ääniä, lähetetään
  // 'GemVisited' eventti ja poistetaan gemi pelistä
  collect: function() {
    this.destroy();
    Crafty.audio.play("gem");
    Crafty.trigger("GemVisited", this);
  }
});

// Aputaulukko jossa ilmansuunnat
var directions = ["n", "s", "e", "w"];

// Vihut
Crafty.c("Monster", {
  required: "Actor, Collision, spr_monster",
  init: function() {
    this.bind("EnterFrame", this.doAi) // EnterFrame eventti kutsutaan joka updatessa
      .bind("Moved", function(from) {
        if (this.hit("Solid")) {
          // vaihetaan suuntaa kun törmätään johonkin
          this.attr({ x: from.x, y: from.y }); // tämä estää seinän sisälle menon
          this.changeDirection();
        } else if (this.hit("PlayerCharacter")) {
          this.changeDirection();
        }
      });

    this.attr({
      dir: Crafty.math.randomElementOfArray(directions) // haetaan satunnainen suunta
    });
  },

  doAi: function() {
    // Tekoäly ei tee muuta kuin liikkuu eteenpäin ja lähettää "Minä liikuin" eventtejä
    var from = { x: this._x, y: this._y };
    this.move(this.dir, 3);
    Crafty.trigger("Moved", from);
  },

  changeDirection: function() {
    // tilapäistaulukko joka ei sisällä tämänhetkistä suuntaa
    var temp_directions = directions.filter(function(element, index, array) {
      return element !== this.dir;
    });
    this.dir = Crafty.math.randomElementOfArray(temp_directions);
  }
});
