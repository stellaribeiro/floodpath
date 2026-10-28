CREATE TABLE IF NOT EXISTS leitura (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sensor_id VARCHAR(255) NOT NULL,
    nivel_agua DOUBLE NOT NULL,
    status VARCHAR(50),
    distancia DOUBLE,
    data_hora DATETIME NOT NULL
);
