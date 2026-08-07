create database floodpath;
use floodpath;

create table Rio(
id int auto_increment primary key,
nivelAgua double,
stutus varchar(225),
dataHora datetime
);

create table PontoAlagado(
titulo varchar (100),
descriçao varchar(225),
latitude double,
longitude double,
severidade varchar(200)
)
select * from Rio;
select * from PontoAlagado;
