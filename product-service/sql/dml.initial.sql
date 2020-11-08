insert into products (title, description, price, author, published, img) values 
  ('Batman: The Killing Joke, Issue 1', null, 9.17, 'Alan Moore, Brian Bolland', '1988', 'https://images-na.ssl-images-amazon.com/images/I/51GgmyZXn4L._SX319_BO1,204,203,200_.jpg'),
  ('V for Vendetta', null, 15.77, 'Alan Moore', '2008', 'https://images-na.ssl-images-amazon.com/images/I/51aOaDhv0GL._SX333_BO1,204,203,200_.jpg'),
  ('What Cats Want: An illustrated guide for truly understanding your cat Hardcover', null, 12.3, 'Dr. Yuki Hattori', '2020', 'https://images-na.ssl-images-amazon.com/images/I/41YQU9NBZBL._SX349_BO1,204,203,200_.jpg')

insert into stocks (product_id, count)
select p.id, floor(random() * 100 + 1) as count from products p
