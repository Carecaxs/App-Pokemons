CREATE DATABASE BD_POKEMON;
GO

USE BD_POKEMON;

--users
CREATE TABLE Users (
  id INT PRIMARY KEY IDENTITY,
  email varchar(255) UNIQUE,
  passwordd varchar(100) not null,
  fullName varchar(100) not null
);

-- table contains all pokemons
CREATE TABLE Pokemons (
  id INT PRIMARY KEY IDENTITY,
  nameP VARCHAR(100) not null,
  baseExperience INT not null,
  height int not null,
  weightP int not null,
  sound_url VARCHAR(255),
  principalImage varchar(500)
);

--select * from users
--join between user and pokemons
CREATE TABLE UsersPokemons (
  id INT PRIMARY KEY IDENTITY,
  idPokemon INT,
  userId INT,
  FOREIGN KEY (idPokemon) REFERENCES Pokemons(id),
  FOREIGN KEY (userId) REFERENCES Users(id)
);


--contains pokemon stats
CREATE TABLE Statss (
  id INT PRIMARY KEY IDENTITY,
  hp int not null,
  attack int not null,
  defense int not null,
  specialAttack int not null,
  specialDefense int not null,
  speed int not null,
  idPokemon INT,
  FOREIGN KEY (idPokemon) REFERENCES Pokemons(id),
);



--contains pokemon abilities
CREATE TABLE Abilities (
  id INT PRIMARY KEY IDENTITY,
  nameAbility VARCHAR(255)
);

--join between pokemon and abilities
CREATE TABLE PokemonAbilities (
  id INT PRIMARY KEY IDENTITY,
  pokemonId INT,
  abilityId INT,
  FOREIGN KEY (pokemonId) REFERENCES Pokemons(id),
  FOREIGN KEY (abilityId) REFERENCES Abilities(id)
);


--contains pokemon moves
CREATE TABLE Moves (
  id INT PRIMARY KEY IDENTITY,
  nameMove VARCHAR(255)
);

--join between pokemon and moves
CREATE TABLE PokemonMoves (
  id INT PRIMARY KEY IDENTITY,
  pokemonId INT,
  moveId INT,
  FOREIGN KEY (pokemonId) REFERENCES Pokemons(id),
  FOREIGN KEY (moveId) REFERENCES Moves(id)
);


--contains pokemon types
CREATE TABLE Typess (
  id INT PRIMARY KEY IDENTITY,
  nameType VARCHAR(255)
);

--join between pokemon and moves
CREATE TABLE PokemonType (
  id INT PRIMARY KEY IDENTITY,
  idType INT,
  pokemonId INT,
  FOREIGN KEY (pokemonId) REFERENCES Pokemons(id),
  FOREIGN KEY (idType) REFERENCES Typess(id)
);

--contains pokemon images
CREATE TABLE Images (
  id INT PRIMARY KEY IDENTITY,
  urlImage VARCHAR(255)
);

--join between pokemon and moves
CREATE TABLE PokemonImages (
  id INT PRIMARY KEY IDENTITY,
  pokemonId INT,
  imageId INT,
  FOREIGN KEY (pokemonId) REFERENCES Pokemons(id),
  FOREIGN KEY (imageId) REFERENCES Images(id)
);


