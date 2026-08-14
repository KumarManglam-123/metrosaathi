-- ==============================================================================
-- MetroSaathi PostgreSQL Schema Initialization & Seed Data (Local Container)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS lines (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  color_hex VARCHAR NOT NULL
);

CREATE TABLE IF NOT EXISTS stations (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  name_kannada VARCHAR,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_interchange BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS station_lines (
  station_id VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  line_id VARCHAR REFERENCES lines(id) ON DELETE CASCADE,
  PRIMARY KEY (station_id, line_id)
);

CREATE TABLE IF NOT EXISTS edges (
  id SERIAL PRIMARY KEY,
  from_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  to_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  line_id VARCHAR REFERENCES lines(id) ON DELETE CASCADE,
  distance_km DOUBLE PRECISION NOT NULL
);

CREATE TABLE IF NOT EXISTS saved_routes (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  from_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  to_station VARCHAR REFERENCES stations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_edges_from ON edges(from_station);
CREATE INDEX IF NOT EXISTS idx_edges_to ON edges(to_station);
CREATE INDEX IF NOT EXISTS idx_station_lines_line ON station_lines(line_id);
CREATE INDEX IF NOT EXISTS idx_saved_routes_user ON saved_routes(user_id);

-- 1. Lines
INSERT INTO lines (id, name, color_hex) VALUES
('purple', 'Purple Line', '#78288C'),
('green', 'Green Line', '#008A3B'),
('yellow', 'Yellow Line', '#F5A623')
ON CONFLICT (id) DO NOTHING;

-- 2. Stations & Station_lines (83 stations)
INSERT INTO stations (id, name, name_kannada, lat, lng, is_interchange) VALUES
('challaghatta', 'Challaghatta', 'ಚಲ್ಲಘಟ್ಟ', 12.9037, 77.4645, false),
('kengeri', 'Kengeri', 'ಕೆಂಗೇರಿ', 12.9079, 77.4764, false),
('kengeri-bus-terminal', 'Kengeri Bus Terminal', 'ಕೆಂಗೇರಿ ಬಸ್ ಟರ್ಮಿನಲ್', 12.9135, 77.4878, false),
('pattanagere', 'Pattanagere', 'ಪಟ್ಟಣಗೆರೆ', 12.9234, 77.4987, false),
('jnanabharathi', 'Jnanabharathi', 'ಜ್ಞಾನಭಾರತಿ', 12.9348, 77.5098, false),
('rajarajeshwari-nagar', 'Rajarajeshwari Nagar', 'ರಾಜರಾಜೇಶ್ವರಿ ನಗರ', 12.9436, 77.5195, false),
('nayandahalli', 'Nayandahalli', 'ನಾಯಂಡಹಳ್ಳಿ', 12.9492, 77.5273, false),
('mysuru-road', 'Mysuru Road', 'ಮೈಸೂರು ರಸ್ತೆ', 12.9538, 77.5385, false),
('deepanjali-nagar', 'Deepanjali Nagar', 'ದೀಪಾಂಜಲಿ ನಗರ', 12.9555, 77.5469, false),
('attiguppe', 'Attiguppe', 'ಅತ್ತಿಗುಪ್ಪೆ', 12.9622, 77.5338, false),
('vijayanagar', 'Vijayanagar', 'ವಿಜಯನಗರ', 12.9691, 77.5375, false),
('hosahalli', 'Hosahalli', 'ಹೊಸಹಳ್ಳಿ', 12.9734, 77.5458, false),
('magadi-road', 'Magadi Road', 'ಮಾಗಡಿ ರಸ್ತೆ', 12.9756, 77.5552, false),
('ksr-bengaluru', 'Krantivira Sangolli Rayanna Railway Station', 'ಕ್ರಾಂತಿವೀರ ಸಂಗೊಳ್ಳಿ ರಾಯಣ್ಣ ರೈಲ್ವೆ ನಿಲ್ದಾಣ', 12.9778, 77.5672, false),
('majestic', 'Nadaprabhu Kempegowda Station, Majestic', 'ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ನಿಲ್ದಾಣ, ಮೆಜೆಸ್ಟಿಕ್', 12.9757, 77.5728, true),
('sir-m-visvesvaraya', 'Sir M. Visvesvaraya Station, Central College', 'ಸರ್ ಎಂ. ವಿಶ್ವೇಶ್ವರಯ್ಯ ನಿಲ್ದಾಣ, ಸೆಂಟ್ರಲ್ ಕಾಲೇಜು', 12.9741, 77.5835, false),
('dr-br-ambedkar-vidhana-soudha', 'Dr. B.R. Ambedkar Station, Vidhana Soudha', 'ಡಾ. ಬಿ.ಆರ್. ಅಂಬೇಡ್ಕರ್ ನಿಲ್ದಾಣ, ವಿಧಾನ ಸೌಧ', 12.9796, 77.5925, false),
('cubbon-park', 'Cubbon Park', 'ಕಬ್ಬನ್ ಪಾರ್ಕ್', 12.9811, 77.5997, false),
('mg-road', 'Mahatma Gandhi Road', 'ಮಹಾತ್ಮ ಗಾಂಧಿ ರಸ್ತೆ', 12.9754, 77.6067, false),
('trinity', 'Trinity', 'ಟ್ರಿನಿಟಿ', 12.9729, 77.6171, false),
('halasuru', 'Halasuru', 'ಹಲಸೂರು', 12.9774, 77.6268, false),
('indiranagar', 'Indiranagar', 'ಇಂದಿರಾನಗರ', 12.9784, 77.6387, false),
('swami-vivekananda-road', 'Swami Vivekananda Road', 'ಸ್ವಾಮಿ ವಿವೇಕಾನಂದ ರಸ್ತೆ', 12.9861, 77.6444, false),
('baiyappanahalli', 'Baiyappanahalli', 'ಬೈಯಪ್ಪನಹಳ್ಳಿ', 12.9912, 77.6521, false),
('benniganahalli', 'Benniganahalli', 'ಬೆನ್ನಿಗಾನಹಳ್ಳಿ', 12.9972, 77.6629, false),
('kr-pura', 'Krishnarajapura', 'ಕೃಷ್ಣರಾಜಪುರ', 12.9995, 77.6775, false),
('singayyanapalya', 'Singayyanapalya', 'ಸಿಂಗಯ್ಯನಪಾಳ್ಯ', 12.9959, 77.6922, false),
('garudacharpalya', 'Garudacharpalya', 'ಗರುಡಾಚಾರ್‌ಪಾಳ್ಯ', 12.9928, 77.7029, false),
('hoodi', 'Hoodi', 'ಹೂಡಿ', 12.9918, 77.7153, false),
('seetharampalya', 'Seetharampalya', 'ಸೀತಾರಾಮಪಾಳ್ಯ', 12.9869, 77.7196, false),
('kundalahalli', 'Kundalahalli', 'ಕುಂದಲಹಳ್ಳಿ', 12.9772, 77.7199, false),
('nallurhalli', 'Nallurhalli', 'ನಲ್ಲೂರಹಳ್ಳಿ', 12.9712, 77.7288, false),
('sri-sathya-sai-hospital', 'Sri Sathya Sai Hospital', 'ಶ್ರೀ ಸತ್ಯ ಸಾಯಿ ಆಸ್ಪತ್ರೆ', 12.9749, 77.7391, false),
('pattandur-agrahara', 'Pattandur Agrahara', 'ಪಟ್ಟಂದೂರು ಅಗ್ರಹಾರ', 12.9818, 77.7471, false),
('kadugodi-tree-park', 'Kadugodi Tree Park', 'ಕಾಡುಗೋಡಿ ಟ್ರೀ ಪಾರ್ಕ್', 12.9902, 77.7533, false),
('hopefarm-channasandra', 'Hopefarm Channasandra', 'ಹೋಪ್‌ಫಾರ್ಮ್ ಚನ್ನಸಂದ್ರ', 12.9982, 77.7588, false),
('whitefield-kadugodi', 'Whitefield (Kadugodi)', 'ವೈಟ್‌ಫೀಲ್ಡ್ (ಕಾಡುಗೋಡಿ)', 13.0076, 77.7608, false),

('madavara', 'Madavara', 'ಮಾದಾವರ', 13.0611, 77.4789, false),
('chikkabidarakallu', 'Chikkabidarakallu', 'ಚಿಕ್ಕಬಿದರಕಲ್ಲು', 13.0531, 77.4912, false),
('manjunathnagar', 'Manjunathnagar', 'ಮಂಜುನಾಥನಗರ', 13.0458, 77.5021, false),
('nagasandra', 'Nagasandra', 'ನಾಗಸಂದ್ರ', 13.0375, 77.5098, false),
('dasarahalli', 'Dasarahalli', 'ದಾಸರಹಳ್ಳಿ', 13.0438, 77.5134, false),
('jalahalli', 'Jalahalli', 'ಜಾಲಹಳ್ಳಿ', 13.0392, 77.5198, false),
('peenya-industry', 'Peenya Industry', 'ಪೀಣ್ಯ ಇಂಡಸ್ಟ್ರಿ', 13.0335, 77.5255, false),
('peenya', 'Peenya', 'ಪೀಣ್ಯ', 13.0287, 77.5312, false),
('goraguntepalya', 'Goraguntepalya', 'ಗೊರಗುಂಟೆಪಾಳ್ಯ', 13.0289, 77.5401, false),
('yeshwanthpur', 'Yeshwanthpur', 'ಯಶವಂತಪುರ', 13.0234, 77.5501, false),
('sandal-soap-factory', 'Sandal Soap Factory', 'ಸ್ಯಾಂಡಲ್ ಸೋಪ್ ಫ್ಯಾಕ್ಟರಿ', 13.0148, 77.5539, false),
('mahalakshmi', 'Mahalakshmi', 'ಮಹಾಲಕ್ಷ್ಮಿ', 13.0079, 77.5492, false),
('rajajinagar', 'Rajajinagar', 'ರಾಜಾಜಿನಗರ', 12.9989, 77.5558, false),
('mahakavi-kuvempu-road', 'Mahakavi Kuvempu Road', 'ಮಹಾಕವಿ ಕುವೆಂಪು ರಸ್ತೆ', 12.9898, 77.5599, false),
('srirampura', 'Srirampura', 'ಶ್ರೀರಾಮಪುರ', 12.9863, 77.5645, false),
('mantri-square-sampige-road', 'Mantri Square Sampige Road', 'ಮಂತ್ರಿ ಸ್ಕ್ವೇರ್ ಸಂಪಿಗೆ ರಸ್ತೆ', 12.9912, 77.5709, false),
('chickpete', 'Chickpete', 'ಚಿಕ್ಕಪೇಟೆ', 12.9681, 77.5742, false),
('krishna-rajendra-market', 'Krishna Rajendra Market', 'ಕೃಷ್ಣ ರಾಜೇಂದ್ರ ಮಾರುಕಟ್ಟೆ', 12.9612, 77.5752, false),
('national-college', 'National College', 'ನ್ಯಾಷನಲ್ ಕಾಲೇಜು', 12.9501, 77.5721, false),
('lalbagh', 'Lalbagh', 'ಲಾಲ್‌ಬಾಗ್', 12.9463, 77.5801, false),
('south-end-circle', 'South End Circle', 'ಸೌತ್ ಎಂಡ್ ಸರ್ಕಲ್', 12.9379, 77.5803, false),
('jayanagar', 'Jayanagar', 'ಜಯನಗರ', 12.9301, 77.5802, false),
('rv-road', 'Rashtreeya Vidyalaya Road', 'ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾಲಯ ರಸ್ತೆ', 12.9216, 77.5801, true),
('banashankari', 'Banashankari', 'ಬನಶಂಕರಿ', 12.9152, 77.5735, false),
('jaya-prakash-nagar', 'Jaya Prakash Nagar', 'ಜಯಪ್ರಕಾಶ ನಗರ', 12.9074, 77.5729, false),
('yelachenahalli', 'Yelachenahalli', 'ಯಲಚೇನಹಳ್ಳಿ', 12.8959, 77.5701, false),
('konanakunte-cross', 'Konanakunte Cross', 'ಕೊನನಕುಂಟೆ ಕ್ರಾಸ್', 12.8848, 77.5638, false),
('doddakallasandra', 'Doddakallasandra', 'ದೊಡ್ಡಕಲ್ಲಸಂದ್ರ', 12.8741, 77.5542, false),
('vajrahalli', 'Vajrahalli', 'ವಜ್ರಹಳ್ಳಿ', 12.8662, 77.5458, false),
('thalaghattapura', 'Thalaghattapura', 'ತಲಘಟ್ಟಪುರ', 12.8572, 77.5381, false),
('silk-institute', 'Silk Institute', 'ರೇಷ್ಮೆ ಸಂಸ್ಥೆ (ಸಿಲ್ಕ್ ಇನ್‌ಸ್ಟಿಟ್ಯೂಟ್)', 12.8465, 77.5301, false),

('ragigudda', 'Ragigudda', 'ರಾಗಿಗುಡ್ಡ', 12.9185, 77.5908, false),
('jayadeva-hospital', 'Jayadeva Hospital', 'ಜಯದೇವ ಆಸ್ಪತ್ರೆ', 12.9168, 77.6012, false),
('btm-layout', 'BTM Layout', 'ಬಿಟಿಎಂ ಲೇಔಟ್', 12.9152, 77.6119, false),
('central-silk-board', 'Central Silk Board', 'ಕೇಂದ್ರ ರೇಷ್ಮೆ ಮಂಡಳಿ (ಸಿಲ್ಕ್ ಬೋರ್ಡ್)', 12.9174, 77.6231, false),
('bommanahalli', 'Bommanahalli', 'ಬೊಮ್ಮನಹಳ್ಳಿ', 12.9058, 77.6318, false),
('hongasandra', 'Hongasandra', 'ಹೊಂಗಸಂದ್ರ', 12.8941, 77.6384, false),
('kudlu-gate', 'Kudlu Gate', 'ಕೂಡ್ಲು ಗೇಟ್', 12.8842, 77.6465, false),
('singasandra', 'Singasandra', 'ಸಿಂಗಸಂದ್ರ', 12.8732, 77.6534, false),
('hosa-road', 'Hosa Road', 'ಹೊಸ ರಸ್ತೆ', 12.8624, 77.6601, false),
('beratena-agrahara', 'Beratena Agrahara', 'ಬೆರಟೇನ ಅಗ್ರಹಾರ', 12.8529, 77.6672, false),
('electronic-city', 'Electronic City', 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ', 12.8427, 77.6749, false),
('infosys-foundation-konappana-agrahara', 'Infosys Foundation Konappana Agrahara', 'ಇನ್ಫೋಸಿಸ್ ಫೌಂಡೇಶನ್ ಕೊನಪ್ಪನ ಅಗ್ರಹಾರ', 12.8335, 77.6811, false),
('huskur-road', 'Huskur Road', 'ಹುಸ್ಕೂರು ರಸ್ತೆ', 12.8229, 77.6874, false),
('hebbagodi', 'Hebbagodi', 'ಹೆಬ್ಬಗೋಡಿ', 12.8124, 77.6931, false),
('bommasandra', 'Bommasandra', 'ಬೊಮ್ಮಸಂದ್ರ', 12.8021, 77.6992, false)
ON CONFLICT (id) DO NOTHING;

-- 3. Station Lines
INSERT INTO station_lines (station_id, line_id) VALUES
('challaghatta', 'purple'), ('kengeri', 'purple'), ('kengeri-bus-terminal', 'purple'),
('pattanagere', 'purple'), ('jnanabharathi', 'purple'), ('rajarajeshwari-nagar', 'purple'),
('nayandahalli', 'purple'), ('mysuru-road', 'purple'), ('deepanjali-nagar', 'purple'),
('attiguppe', 'purple'), ('vijayanagar', 'purple'), ('hosahalli', 'purple'),
('magadi-road', 'purple'), ('ksr-bengaluru', 'purple'), ('majestic', 'purple'),
('sir-m-visvesvaraya', 'purple'), ('dr-br-ambedkar-vidhana-soudha', 'purple'),
('cubbon-park', 'purple'), ('mg-road', 'purple'), ('trinity', 'purple'),
('halasuru', 'purple'), ('indiranagar', 'purple'), ('swami-vivekananda-road', 'purple'),
('baiyappanahalli', 'purple'), ('benniganahalli', 'purple'), ('kr-pura', 'purple'),
('singayyanapalya', 'purple'), ('garudacharpalya', 'purple'), ('hoodi', 'purple'),
('seetharampalya', 'purple'), ('kundalahalli', 'purple'), ('nallurhalli', 'purple'),
('sri-sathya-sai-hospital', 'purple'), ('pattandur-agrahara', 'purple'),
('kadugodi-tree-park', 'purple'), ('hopefarm-channasandra', 'purple'),
('whitefield-kadugodi', 'purple'),

('madavara', 'green'), ('chikkabidarakallu', 'green'), ('manjunathnagar', 'green'),
('nagasandra', 'green'), ('dasarahalli', 'green'), ('jalahalli', 'green'),
('peenya-industry', 'green'), ('peenya', 'green'), ('goraguntepalya', 'green'),
('yeshwanthpur', 'green'), ('sandal-soap-factory', 'green'), ('mahalakshmi', 'green'),
('rajajinagar', 'green'), ('mahakavi-kuvempu-road', 'green'), ('srirampura', 'green'),
('mantri-square-sampige-road', 'green'), ('majestic', 'green'), ('chickpete', 'green'),
('krishna-rajendra-market', 'green'), ('national-college', 'green'), ('lalbagh', 'green'),
('south-end-circle', 'green'), ('jayanagar', 'green'), ('rv-road', 'green'),
('banashankari', 'green'), ('jaya-prakash-nagar', 'green'), ('yelachenahalli', 'green'),
('konanakunte-cross', 'green'), ('doddakallasandra', 'green'), ('vajrahalli', 'green'),
('thalaghattapura', 'green'), ('silk-institute', 'green'),

('rv-road', 'yellow'), ('ragigudda', 'yellow'), ('jayadeva-hospital', 'yellow'),
('btm-layout', 'yellow'), ('central-silk-board', 'yellow'), ('bommanahalli', 'yellow'),
('hongasandra', 'yellow'), ('kudlu-gate', 'yellow'), ('singasandra', 'yellow'),
('hosa-road', 'yellow'), ('beratena-agrahara', 'yellow'), ('electronic-city', 'yellow'),
('infosys-foundation-konappana-agrahara', 'yellow'), ('huskur-road', 'yellow'),
('hebbagodi', 'yellow'), ('bommasandra', 'yellow')
ON CONFLICT (station_id, line_id) DO NOTHING;

-- 4. Edges
INSERT INTO edges (from_station, to_station, line_id, distance_km) VALUES
('challaghatta', 'kengeri', 'purple', 1.5),
('kengeri', 'kengeri-bus-terminal', 'purple', 1.2),
('kengeri-bus-terminal', 'pattanagere', 'purple', 1.3),
('pattanagere', 'jnanabharathi', 'purple', 1.4),
('jnanabharathi', 'rajarajeshwari-nagar', 'purple', 1.2),
('rajarajeshwari-nagar', 'nayandahalli', 'purple', 1.1),
('nayandahalli', 'mysuru-road', 'purple', 1.2),
('mysuru-road', 'deepanjali-nagar', 'purple', 1.0),
('deepanjali-nagar', 'attiguppe', 'purple', 1.4),
('attiguppe', 'vijayanagar', 'purple', 1.1),
('vijayanagar', 'hosahalli', 'purple', 1.0),
('hosahalli', 'magadi-road', 'purple', 1.2),
('magadi-road', 'ksr-bengaluru', 'purple', 1.4),
('ksr-bengaluru', 'majestic', 'purple', 0.9),
('majestic', 'sir-m-visvesvaraya', 'purple', 1.1),
('sir-m-visvesvaraya', 'dr-br-ambedkar-vidhana-soudha', 'purple', 1.1),
('dr-br-ambedkar-vidhana-soudha', 'cubbon-park', 'purple', 0.9),
('cubbon-park', 'mg-road', 'purple', 1.1),
('mg-road', 'trinity', 'purple', 1.1),
('trinity', 'halasuru', 'purple', 1.2),
('halasuru', 'indiranagar', 'purple', 1.3),
('indiranagar', 'swami-vivekananda-road', 'purple', 1.0),
('swami-vivekananda-road', 'baiyappanahalli', 'purple', 1.1),
('baiyappanahalli', 'benniganahalli', 'purple', 1.3),
('benniganahalli', 'kr-pura', 'purple', 1.5),
('kr-pura', 'singayyanapalya', 'purple', 1.6),
('singayyanapalya', 'garudacharpalya', 'purple', 1.2),
('garudacharpalya', 'hoodi', 'purple', 1.3),
('hoodi', 'seetharampalya', 'purple', 1.2),
('seetharampalya', 'kundalahalli', 'purple', 1.1),
('kundalahalli', 'nallurhalli', 'purple', 1.2),
('nallurhalli', 'sri-sathya-sai-hospital', 'purple', 1.2),
('sri-sathya-sai-hospital', 'pattandur-agrahara', 'purple', 1.1),
('pattandur-agrahara', 'kadugodi-tree-park', 'purple', 1.2),
('kadugodi-tree-park', 'hopefarm-channasandra', 'purple', 1.1),
('hopefarm-channasandra', 'whitefield-kadugodi', 'purple', 1.2),

('madavara', 'chikkabidarakallu', 'green', 1.4),
('chikkabidarakallu', 'manjunathnagar', 'green', 1.3),
('manjunathnagar', 'nagasandra', 'green', 1.2),
('nagasandra', 'dasarahalli', 'green', 1.1),
('dasarahalli', 'jalahalli', 'green', 1.1),
('jalahalli', 'peenya-industry', 'green', 1.0),
('peenya-industry', 'peenya', 'green', 0.9),
('peenya', 'goraguntepalya', 'green', 1.3),
('goraguntepalya', 'yeshwanthpur', 'green', 1.3),
('yeshwanthpur', 'sandal-soap-factory', 'green', 1.1),
('sandal-soap-factory', 'mahalakshmi', 'green', 1.1),
('mahalakshmi', 'rajajinagar', 'green', 1.2),
('rajajinagar', 'mahakavi-kuvempu-road', 'green', 1.1),
('mahakavi-kuvempu-road', 'srirampura', 'green', 0.9),
('srirampura', 'mantri-square-sampige-road', 'green', 1.0),
('mantri-square-sampige-road', 'majestic', 'green', 1.6),
('majestic', 'chickpete', 'green', 1.1),
('chickpete', 'krishna-rajendra-market', 'green', 0.9),
('krishna-rajendra-market', 'national-college', 'green', 1.3),
('national-college', 'lalbagh', 'green', 1.0),
('lalbagh', 'south-end-circle', 'green', 1.1),
('south-end-circle', 'jayanagar', 'green', 1.0),
('jayanagar', 'rv-road', 'green', 1.1),
('rv-road', 'banashankari', 'green', 1.3),
('banashankari', 'jaya-prakash-nagar', 'green', 1.1),
('jaya-prakash-nagar', 'yelachenahalli', 'green', 1.5),
('yelachenahalli', 'konanakunte-cross', 'green', 1.3),
('konanakunte-cross', 'doddakallasandra', 'green', 1.2),
('doddakallasandra', 'vajrahalli', 'green', 1.1),
('vajrahalli', 'thalaghattapura', 'green', 1.2),
('thalaghattapura', 'silk-institute', 'green', 1.5),

('rv-road', 'ragigudda', 'yellow', 1.3),
('ragigudda', 'jayadeva-hospital', 'yellow', 1.2),
('jayadeva-hospital', 'btm-layout', 'yellow', 1.2),
('btm-layout', 'central-silk-board', 'yellow', 1.4),
('central-silk-board', 'bommanahalli', 'yellow', 1.4),
('bommanahalli', 'hongasandra', 'yellow', 1.3),
('hongasandra', 'kudlu-gate', 'yellow', 1.2),
('kudlu-gate', 'singasandra', 'yellow', 1.3),
('singasandra', 'hosa-road', 'yellow', 1.3),
('hosa-road', 'beratena-agrahara', 'yellow', 1.2),
('beratena-agrahara', 'electronic-city', 'yellow', 1.4),
('electronic-city', 'infosys-foundation-konappana-agrahara', 'yellow', 1.2),
('infosys-foundation-konappana-agrahara', 'huskur-road', 'yellow', 1.3),
('huskur-road', 'hebbagodi', 'yellow', 1.3),
('hebbagodi', 'bommasandra', 'yellow', 1.4);
