create table products (
	id uuid primary key default uuid_generate_v4(),
	title text,
	description text,
	price numeric(10,2),
	author text,
	published text,
	img text
);

create table stocks (
	count integer,
	product_id uuid,
	foreign key("product_id") references "products"
);