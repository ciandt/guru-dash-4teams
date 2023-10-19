CREATE TABLE IF NOT EXISTS metricConfig (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name varchar(100) NOT NULL,
	meta json NOT NULL,
    provider varchar(10) NOT NULL
);
