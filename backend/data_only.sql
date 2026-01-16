TRUNCATE TABLE public."PlaylistSong" CASCADE;
TRUNCATE TABLE public."HomePageFeed" CASCADE;
TRUNCATE TABLE public."Playlist" CASCADE;
TRUNCATE TABLE public."PasswordResetToken" CASCADE;
TRUNCATE TABLE public."MagicToken" CASCADE;
TRUNCATE TABLE public."session" CASCADE;
TRUNCATE TABLE public."Song" CASCADE;
TRUNCATE TABLE public."User" CASCADE;
TRUNCATE TABLE public."_prisma_migrations" CASCADE;

COPY public."User" (id, username, password, "createdAt", "updatedAt", email) FROM stdin;
125d04a6-377e-407a-b5f2-fbb9aca1a4aa	thenickjantz+2	$2b$10$nlY9geQbINc.Q8OHqi17DOR9MUm3ekLXMTdIMRl7qpYJd56D.a7fS	2026-01-15 03:03:11.758	2026-01-15 03:03:11.758	\N
938cc860-99e2-4540-ab12-09236fb841b0	nj	$2b$10$mZ6EK.8Mk26pYgg9p6PtROLbxfPYN3jWbp46FXTaIIwGSqCyhbHnC	2026-01-15 03:24:19.683	2026-01-15 03:24:25.619	thenickjantz+2@gmail.com
c5f6207e-f538-4486-b9c1-08fac194ddf8	\N	$2b$10$TEjdf2fKPbisv0Qcg0XzGeXHPrvuO/DG9Gw8SkpOVG8x7wIXP9ZqK	2026-01-15 03:25:27.523	2026-01-15 03:25:27.523	thenickjantz+3@gmail.com
38b53d85-900d-49a2-8093-b800dcee652d	nj2	$2b$10$GPr0M69jgJ2R4OhMWM3H4OQKsMWxfTHkgMbm0tpliysH1IB8y3nQm	2026-01-15 03:26:44.111	2026-01-15 03:26:44.111	\N
a5d72513-90e2-4efe-ac6a-4a6766cf86aa	nickjantz	$2b$10$J3zrfuAejB6ZtPdt5C5k3ej0ZbF1PYr0tNCkuBVXKZ8wMK7oi.3Ou	2026-01-14 23:20:11.945	2026-01-15 07:24:13.812	thenickjantz@gmail.com
\.

COPY public."Song" (id, title, artist, "youtubeId", "thumbnailUrl", duration, "createdAt", "updatedAt") FROM stdin;
387ac98c-9147-41aa-ac0c-90b0c9fdfb16	Enrique Iglesias - Bailando ft. Descemer Bueno, Gente De Zona	EnriqueIglesiasVEVO	NUsoVlDFqZg	https://i.ytimg.com/vi/NUsoVlDFqZg/hqdefault.jpg	\N	2026-01-14 23:49:42.546	2026-01-14 23:49:42.546
929d53f2-435d-448f-9324-c4c58649628a	Anuel AA - Ella Quiere Beber (Remix) ft. Romeo Santos	AnuelVEVO	0w3XwPVxcsw	https://i.ytimg.com/vi/0w3XwPVxcsw/hqdefault.jpg	\N	2026-01-15 00:02:00.303	2026-01-15 00:02:00.303
8cc8cd2c-3dd0-406f-9e3a-8af5aafab3cd	Enrique Iglesias - DUELE EL CORAZON (Lyric Video) ft. Wisin	EnriqueIglesiasVEVO	vSk_xOy6Bwc	https://i.ytimg.com/vi/vSk_xOy6Bwc/hqdefault.jpg	\N	2026-01-15 00:18:41.985	2026-01-15 00:18:41.985
a1e3ed4b-a0d2-4960-8220-f21ec017aacd	Luis Fonsi, Demi Lovato - Échame La Culpa	LuisFonsiVEVO	TyHvyGVs42U	https://i.ytimg.com/vi/TyHvyGVs42U/hqdefault.jpg	\N	2026-01-15 00:19:18.228	2026-01-15 00:19:18.228
75bb9061-0c43-42e4-b4e0-171da75fae11	Maluma - Corazón (Official Video) ft. Nego do Borel	MalumaVEVO	GmHrjFIWl6U	https://i.ytimg.com/vi/GmHrjFIWl6U/hqdefault.jpg	\N	2026-01-15 00:36:32.776	2026-01-15 00:36:32.776
e9ed956a-a2ae-4e2d-9395-a75f4b5ff55d	Ricky Martin - Vente Pa' Ca (Official Video) ft. Maluma	RickyMartinVEVO	iOe6dI2JhgU	https://i.ytimg.com/vi/iOe6dI2JhgU/hqdefault.jpg	\N	2026-01-15 00:36:32.817	2026-01-15 00:36:32.817
b8dea9f3-7d83-4e3e-9ef4-8deef413b148	Maluma - Felices los 4 (Official Video)	MalumaVEVO	t_jHrUE5IOk	https://i.ytimg.com/vi/t_jHrUE5IOk/hqdefault.jpg	\N	2026-01-15 00:36:32.859	2026-01-15 00:36:32.859
36bfb366-3c31-43ef-8c9f-9fc1f21043b3	21. El Perdón - Nicky Jam y Enrique Iglesias  (Official Music Video YTMAs)	NickyJamTV	hXI8RQYC36Q	https://i.ytimg.com/vi/hXI8RQYC36Q/hqdefault.jpg	\N	2026-01-15 00:36:32.898	2026-01-15 00:36:32.898
509ef999-d605-4376-8b85-d1841a1dd461	CNCO - Reggaetón Lento (Bailemos)	CNCOVEVO	7jpqqBX-Myw	https://i.ytimg.com/vi/7jpqqBX-Myw/hqdefault.jpg	\N	2026-01-15 00:36:32.944	2026-01-15 00:36:32.944
eef4f8bf-a9fa-4f4c-8457-6a9a7bb022f3	Becky G, Bad Bunny - Mayores (Official Video)	BeckyGVEVO	GMFewiplIbw	https://i.ytimg.com/vi/GMFewiplIbw/hqdefault.jpg	\N	2026-01-15 00:36:32.99	2026-01-15 00:36:32.99
8af623c3-4b39-4b40-93b5-73dcd3ddf9c3	Daddy Yankee & Snow - Con Calma (Video Oficial)	Daddy Yankee	DiItGE3eAyQ	https://i.ytimg.com/vi/DiItGE3eAyQ/hqdefault.jpg	\N	2026-01-15 00:36:33.047	2026-01-15 00:36:33.047
4e580803-ee19-405f-91b2-bd6e3d64e7a6	Natti Natasha ❌ Ozuna - Criminal [Official Video]	NATTI NATASHA 	VqEbCxg2bNI	https://i.ytimg.com/vi/VqEbCxg2bNI/hqdefault.jpg	\N	2026-01-15 00:36:33.092	2026-01-15 00:36:33.092
09867450-f63c-4d32-984d-19ce9c94d5ed	Daddy Yankee - Dura (Video Oficial)	Daddy Yankee	sGIm0-dQd8M	https://i.ytimg.com/vi/sGIm0-dQd8M/hqdefault.jpg	\N	2026-01-15 00:36:33.142	2026-01-15 00:36:33.142
feb1d143-4408-4a8f-995c-b86ec833eb6b	Shakira - Chantaje (Official Video) ft. Maluma	shakiraVEVO	6Mgqbai3fKo	https://i.ytimg.com/vi/6Mgqbai3fKo/hqdefault.jpg	\N	2026-01-15 00:36:33.187	2026-01-15 00:36:33.187
d02a3d31-43ae-4e4d-b96f-f461b507a322	KAROL G, Nicki Minaj - Tusa (Official Video)	KarolGVEVO	tbneQDc2H3I	https://i.ytimg.com/vi/tbneQDc2H3I/hqdefault.jpg	\N	2026-01-15 00:36:33.227	2026-01-15 00:36:33.227
36d1a9ac-d3dc-43c7-995a-e9d4c6d9483e	X (EQUIS) - Nicky Jam x J. Balvin | Video Oficial  (Prod. Afro Bros & Jeon)	NickyJamTV	_I_D_8Z4sJE	https://i.ytimg.com/vi/_I_D_8Z4sJE/hqdefault.jpg	\N	2026-01-15 00:36:33.266	2026-01-15 00:36:33.266
b022d4be-2896-42cd-abc4-365f876f64cc	Luis Fonsi, Ozuna - Imposible (Official Video)	LuisFonsiVEVO	De4FqIkvHX0	https://i.ytimg.com/vi/De4FqIkvHX0/hqdefault.jpg	\N	2026-01-15 00:36:33.31	2026-01-15 00:36:33.31
272ed9e9-0928-46de-90b4-f7e6bcaed4cc	Maluma - Hawái (Official Video)	MalumaVEVO	pK060iUFWXg	https://i.ytimg.com/vi/pK060iUFWXg/hqdefault.jpg	\N	2026-01-15 00:36:33.356	2026-01-15 00:36:33.356
a2dfd5c6-bd69-43bc-bd2f-dc2528d855e4	Pedro Capó, Farruko - Calma (Remix - Official Video)	capoVEVO	1_zgKRBrT0Y	https://i.ytimg.com/vi/1_zgKRBrT0Y/hqdefault.jpg	\N	2026-01-15 00:36:33.406	2026-01-15 00:36:33.406
d6ff7f02-cb9e-492b-a736-c75ea69582ea	Shakira - La Tortura (Official HD Video) ft. Alejandro Sanz	shakiraVEVO	Dsp_8Lm1eSk	https://i.ytimg.com/vi/Dsp_8Lm1eSk/hqdefault.jpg	\N	2026-01-15 00:36:33.47	2026-01-15 00:36:33.47
3c0b57be-43be-4a5c-8978-e76f20974686	Gente de Zona - La Gozadera (Official Video) ft. Marc Anthony	GenteDeZonaVEVO	VMp55KH_3wo	https://i.ytimg.com/vi/VMp55KH_3wo/hqdefault.jpg	\N	2026-01-15 00:36:33.515	2026-01-15 00:36:33.515
7e3b2856-3532-4f01-a81e-759016192e35	Daddy Yankee - Limbo (Video Oficial)	DaddyYankeeVEVO	6BTjG-dhf5s	https://i.ytimg.com/vi/6BTjG-dhf5s/hqdefault.jpg	\N	2026-01-15 00:36:33.557	2026-01-15 00:36:33.557
2c0bd7d3-376e-45f1-9def-c96e0d673048	Farruko - Pepas (Official Video)	FARRUKOVEVO	y8trd3gjJt0	https://i.ytimg.com/vi/y8trd3gjJt0/hqdefault.jpg	\N	2026-01-15 00:36:33.611	2026-01-15 00:36:33.611
64e90c94-18db-4f0b-a0d5-47563d8da9a0	KAROL G - Si Antes Te Hubiera Conocido | Coke Studio	KarolGVEVO	QCZZwZQ4qNs	https://i.ytimg.com/vi/QCZZwZQ4qNs/hqdefault.jpg	\N	2026-01-15 00:36:33.656	2026-01-15 00:36:33.656
669b58c1-5d80-47a4-b72d-487195804a5f	Chino y Nacho - Andas En Mi Cabeza ft. Daddy Yankee	ChinoNachoVEVO	AMTAQ-AJS4Y	https://i.ytimg.com/vi/AMTAQ-AJS4Y/hqdefault.jpg	\N	2026-01-15 00:36:33.7	2026-01-15 00:36:33.7
771772c4-9019-4739-8aa1-2d04ca75885a	Luis Fonsi, Sebastián Yatra, Nicky Jam - Date La Vuelta (Official Video)	LuisFonsiVEVO	n5jRwdEwLOY	https://i.ytimg.com/vi/n5jRwdEwLOY/hqdefault.jpg	\N	2026-01-15 00:36:33.74	2026-01-15 00:36:33.74
98b6ef6e-adb7-4573-bb23-dff1938cc4d3	Alex Sensation, Ozuna - Que Va	AlexSensationVEVO	9J9FlVCUeLM	https://i.ytimg.com/vi/9J9FlVCUeLM/hqdefault.jpg	\N	2026-01-15 00:36:33.782	2026-01-15 00:36:33.782
5a7d5e59-6cdf-4e42-8c48-541fb5cd27c1	BAD BUNNY - DeBÍ TiRAR MáS FOToS (Short Film)	Bad Bunny	gLSzEYVDads	https://i.ytimg.com/vi/gLSzEYVDads/hqdefault.jpg	\N	2026-01-15 00:37:57.015	2026-01-15 00:37:57.015
9f006a6f-0503-4b7c-b9af-044d682cd621	BAD BUNNY - NUEVAYoL (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	zAfrPjTvSNs	https://i.ytimg.com/vi/zAfrPjTvSNs/hqdefault.jpg	\N	2026-01-15 00:37:57.057	2026-01-15 00:37:57.057
bcacad90-5545-4b17-acef-4fa96ba47890	BAD BUNNY - VOY A LLeVARTE PA PR (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	X2MGCIDOMZ4	https://i.ytimg.com/vi/X2MGCIDOMZ4/hqdefault.jpg	\N	2026-01-15 00:37:57.097	2026-01-15 00:37:57.097
9fdb4d17-2814-400a-8b82-76b914176d42	BAD BUNNY - BAILE INoLVIDABLE (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	2Y4zvxK0wYM	https://i.ytimg.com/vi/2Y4zvxK0wYM/hqdefault.jpg	\N	2026-01-15 00:37:57.136	2026-01-15 00:37:57.136
afe06d11-f5c3-4d66-b081-8149596eee42	BAD BUNNY - BAILE INoLVIDABLE (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	a1Femq4NPxs	https://i.ytimg.com/vi/a1Femq4NPxs/hqdefault.jpg	\N	2026-01-15 00:37:57.175	2026-01-15 00:37:57.175
4eabfae5-0a37-4bb0-a5da-fcb4c2e5c8c0	BAD BUNNY ft. RaiNao - PERFuMITO NUEVO (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	XphyMFdyyEg	https://i.ytimg.com/vi/XphyMFdyyEg/hqdefault.jpg	\N	2026-01-15 00:37:57.216	2026-01-15 00:37:57.216
2819d299-e183-4e1a-b6a4-df324ac93d44	BAD BUNNY ft. Chuwi - WELTiTA (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	hitCWMxsMi4	https://i.ytimg.com/vi/hitCWMxsMi4/hqdefault.jpg	\N	2026-01-15 00:37:57.259	2026-01-15 00:37:57.259
f7a8f7c8-960e-4077-bea4-d5aecdf05bcb	BAD BUNNY ft. Chuwi - WELTiTA (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	vmbyVU9w47Y	https://i.ytimg.com/vi/vmbyVU9w47Y/hqdefault.jpg	\N	2026-01-15 00:37:57.299	2026-01-15 00:37:57.299
3439715d-2b6e-43f7-a224-f4b039c6b8b8	BAD BUNNY ft. Dei V, Omar Courtz - VeLDÁ (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	yNEpyU3PnDI	https://i.ytimg.com/vi/yNEpyU3PnDI/hqdefault.jpg	\N	2026-01-15 00:37:57.338	2026-01-15 00:37:57.338
e8b3f770-c8c1-4e80-a597-90739dfb3de8	BAD BUNNY - EL CLúB (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	xDWLZ8ML52k	https://i.ytimg.com/vi/xDWLZ8ML52k/hqdefault.jpg	\N	2026-01-15 00:37:57.387	2026-01-15 00:37:57.387
5a0e2400-7110-40f1-987f-69bb9991bc6b	BAD BUNNY - EL CLúB (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	7f6SxWMOpdU	https://i.ytimg.com/vi/7f6SxWMOpdU/hqdefault.jpg	\N	2026-01-15 00:37:57.438	2026-01-15 00:37:57.438
1e3f37b5-2e14-4bf0-8ad3-aa2b3cba11b4	BAD BUNNY - KETU TeCRÉ (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	oSGgWlzZ9ko	https://i.ytimg.com/vi/oSGgWlzZ9ko/hqdefault.jpg	\N	2026-01-15 00:37:57.479	2026-01-15 00:37:57.479
526ac2d8-b22c-4be6-a341-f1bfe534d630	BAD BUNNY - KETU TeCRÉ (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	aoXDGMZhdJk	https://i.ytimg.com/vi/aoXDGMZhdJk/hqdefault.jpg	\N	2026-01-15 00:37:57.521	2026-01-15 00:37:57.521
83036e8c-63b1-41ed-a2d3-9b84ec95f2fc	BAD BUNNY - BOKeTE (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	snvw6iG-GaY	https://i.ytimg.com/vi/snvw6iG-GaY/hqdefault.jpg	\N	2026-01-15 00:37:57.565	2026-01-15 00:37:57.565
7d416bf2-9b34-441a-82cf-91801caa5106	BAD BUNNY - BOKeTE (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	O-WsQlXaa0E	https://i.ytimg.com/vi/O-WsQlXaa0E/hqdefault.jpg	\N	2026-01-15 00:37:57.608	2026-01-15 00:37:57.608
95678ae2-d6fd-4ca8-90e1-4422c681331d	BAD BUNNY - KLOuFRENS (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	3af9KM3Eq-E	https://i.ytimg.com/vi/3af9KM3Eq-E/hqdefault.jpg	\N	2026-01-15 00:37:57.65	2026-01-15 00:37:57.65
3d3eec36-1e42-48f7-96bc-488450a6df74	BAD BUNNY - TURiSTA (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	z608DuScKjs	https://i.ytimg.com/vi/z608DuScKjs/hqdefault.jpg	\N	2026-01-15 00:37:57.697	2026-01-15 00:37:57.697
ee8db240-6531-4fe2-be38-55d62836aa86	BAD BUNNY - TURiSTA (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	H7-7TXXnw8I	https://i.ytimg.com/vi/H7-7TXXnw8I/hqdefault.jpg	\N	2026-01-15 00:37:57.736	2026-01-15 00:37:57.736
1329c9f2-5482-4eaa-9afd-b9020a533e3d	BAD BUNNY ft. Pleneros de la Cresta - CAFé CON RON (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	bk2GZWHV3o4	https://i.ytimg.com/vi/bk2GZWHV3o4/hqdefault.jpg	\N	2026-01-15 00:37:57.777	2026-01-15 00:37:57.777
0f8f113b-aa35-4eb0-8d2c-b10c369202c8	BAD BUNNY - PIToRRO DE COCO (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	ms4ETz5RXIY	https://i.ytimg.com/vi/ms4ETz5RXIY/hqdefault.jpg	\N	2026-01-15 00:37:57.837	2026-01-15 00:37:57.837
6f35325c-6f91-4c21-835a-0f30a454162e	BAD BUNNY - PIToRRO DE COCO (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	EVgd4gvY0hU	https://i.ytimg.com/vi/EVgd4gvY0hU/hqdefault.jpg	\N	2026-01-15 00:37:57.877	2026-01-15 00:37:57.877
66e52c2e-4aae-436d-a07c-79a86882d4b2	BAD BUNNY - LO QUE LE PASÓ A HAWAii (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	uvfDaZ4ZT80	https://i.ytimg.com/vi/uvfDaZ4ZT80/hqdefault.jpg	\N	2026-01-15 00:37:57.92	2026-01-15 00:37:57.92
5c37c1ce-d2fe-401f-b3f3-0549f3ffbef2	BAD BUNNY - EoO (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	myDIeOjqQos	https://i.ytimg.com/vi/myDIeOjqQos/hqdefault.jpg	\N	2026-01-15 00:37:57.961	2026-01-15 00:37:57.961
87159871-8f59-4667-9e34-af15dada151c	BAD BUNNY - DtMF (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	v9T_MGfzq7I	https://i.ytimg.com/vi/v9T_MGfzq7I/hqdefault.jpg	\N	2026-01-15 00:37:58.006	2026-01-15 00:37:58.006
30f10a24-1e5e-43a3-946d-995508b9e918	BAD BUNNY - LA MuDANZA (Visualizer) | DeBÍ TiRAR MáS FOToS	Bad Bunny	lqX1S9mFHbU	https://i.ytimg.com/vi/lqX1S9mFHbU/hqdefault.jpg	\N	2026-01-15 00:37:58.05	2026-01-15 00:37:58.05
93c48810-a299-4d76-90ea-5c72a06c0c8c	BAD BUNNY - LA MuDANZA (Video Oficial) | DeBÍ TiRAR MáS FOToS	Bad Bunny	qYAONSDnMrc	https://i.ytimg.com/vi/qYAONSDnMrc/hqdefault.jpg	\N	2026-01-15 00:37:58.093	2026-01-15 00:37:58.093
7d35699d-9c11-47f1-9d45-d3f6731e6060	BAD BUNNY - CHAMBEA (Video Oficial)	Bad Bunny	gpIBmED4oss	https://i.ytimg.com/vi/gpIBmED4oss/hqdefault.jpg	\N	2026-01-15 01:57:15.411	2026-01-15 01:57:15.411
2746124a-2992-46a8-be0f-030d7395c0ce	Me Llueven	Mark B - Topic	xY8iLoKs-Oo	https://i.ytimg.com/vi/xY8iLoKs-Oo/hqdefault.jpg	\N	2026-01-15 01:57:20.854	2026-01-15 01:57:20.854
c82c23ee-2e0b-4105-8220-8964da6a422f	Bad Bunny X El Alfa El Jefe - Dema Ga Ge Gi Go Gu [Video Oficial]	Hear This Music	ce5sdKxpE3s	https://i.ytimg.com/vi/ce5sdKxpE3s/hqdefault.jpg	\N	2026-01-15 01:57:26.367	2026-01-15 01:57:26.367
4d077a0b-02ca-4c8a-beb2-bfb9c4ae4472	Ozuna - Síguelo Bailando (Video Oficial)	Ozuna	Dvpd9_5vuks	https://i.ytimg.com/vi/Dvpd9_5vuks/hqdefault.jpg	\N	2026-01-15 01:57:31.692	2026-01-15 01:57:31.692
1bf144d9-bec7-4bf7-8e77-4da2c67523e5	J Balvin, Jowell & Randy - Bonita (Official Video)	jbalvinVEVO	SqpvOqRieYY	https://i.ytimg.com/vi/SqpvOqRieYY/hqdefault.jpg	\N	2026-01-15 01:57:37.077	2026-01-15 01:57:37.077
a898dcef-0b5b-43d1-8bb3-9bae5600c87e	Arcángel, Bryant Myers - Po' Encima (Video Oficial)	Arcangel	hNE7OcIf7cA	https://i.ytimg.com/vi/hNE7OcIf7cA/hqdefault.jpg	\N	2026-01-15 01:57:42.695	2026-01-15 01:57:42.695
49115c2a-9e51-435b-864e-109d8650193c	Brytiago x Darell - Asesina (Video Oficial)	BrytiagoTV	AhQcNVyndSM	https://i.ytimg.com/vi/AhQcNVyndSM/hqdefault.jpg	\N	2026-01-15 01:57:48.18	2026-01-15 01:57:48.18
22654a31-ebc2-42dc-a8f7-7f257a85b5aa	Jon Z - 0 Sentimientos (Remix) ft. Baby Rasta, Noriel, Lyan, Darkiel, Messiah [Official Video]	Chosen Few Emerald Entertainment, Inc.	VEDwgvdXUF4	https://i.ytimg.com/vi/VEDwgvdXUF4/hqdefault.jpg	\N	2026-01-15 01:57:54.055	2026-01-15 01:57:54.055
d56b66e5-ae76-433c-a62e-56aaad1f3c09	Amenazzy ft. Lary Over - Solo (Video Oficial)	Amenazzy	hqJayni4mTU	https://i.ytimg.com/vi/hqJayni4mTU/hqdefault.jpg	\N	2026-01-15 01:57:59.629	2026-01-15 01:57:59.629
0693ca7b-16de-4de6-a4f7-907243fe6d46	Ozuna x Daddy Yankee x Plan B - El Desorden [Lyric Video]	Pina Records	rMgckv9jkWQ	https://i.ytimg.com/vi/rMgckv9jkWQ/hqdefault.jpg	\N	2026-01-15 01:58:05.167	2026-01-15 01:58:05.167
f1d72316-df20-4e9c-9f77-2c13e8636e6d	Arcangel x Bad Bunny X Dj Luian X Mambo Kingz - Tu No Vive Asi [Video oficial]	Hear This Music	CUYrEiymUMY	https://i.ytimg.com/vi/CUYrEiymUMY/hqdefault.jpg	\N	2026-01-15 01:58:10.646	2026-01-15 01:58:10.646
3ed9bbce-8d72-4481-9e4f-d75c5cde87ce	Lary Over & Lírico En la Casa - Subete (Official Video)	Lary Over	a9CITJ8xdPA	https://i.ytimg.com/vi/a9CITJ8xdPA/hqdefault.jpg	\N	2026-01-15 01:58:16.096	2026-01-15 01:58:16.096
9810f00c-c1a7-4e09-bd3f-43392dfaecd4	Maluma - Cuatro Babys (Official Video) ft. Trap Capos, Noriel, Bryant Myers, Juhn	MalumaVEVO	OXq-JP8w5H4	https://i.ytimg.com/vi/OXq-JP8w5H4/hqdefault.jpg	\N	2026-01-15 01:58:21.541	2026-01-15 01:58:21.541
3ea840e1-035b-4eb7-a878-46eb4c3b112a	Romeo Santos, Daddy Yankee, Nicky Jam - Bella y Sensual (Official Video)	RomeoSantosVEVO	RSRzIrOqaN4	https://i.ytimg.com/vi/RSRzIrOqaN4/hqdefault.jpg	\N	2026-01-15 01:58:27.014	2026-01-15 01:58:27.014
4d232c52-3cfa-4954-8110-70d762380d7b	Carlos Vives, Shakira - La Bicicleta	CarlosVivesVEVO	-UV0QGLmYys	https://i.ytimg.com/vi/-UV0QGLmYys/hqdefault.jpg	\N	2026-01-15 02:04:45.464	2026-01-15 02:04:45.464
478b9231-6b77-4876-86fb-d82d869a21bb	22. Hasta el Amanecer - Nicky Jam | Video Oficial	NickyJamTV	kkx-7fsiWgg	https://i.ytimg.com/vi/kkx-7fsiWgg/hqdefault.jpg	\N	2026-01-15 02:04:51.057	2026-01-15 02:04:51.057
37404216-13ce-45cd-9db0-d4370a0d6b2e	Bryant Myers - Tanta Falta REMIX ft. Nicky Jam (Video Oficial)	Bryant Myers	F4egmvyf2eQ	https://i.ytimg.com/vi/F4egmvyf2eQ/hqdefault.jpg	\N	2026-01-15 02:04:56.881	2026-01-15 02:04:56.881
b26a0a15-086f-46e8-8fc2-c9327cb90b10	MACKLEMORE & RYAN LEWIS - THRIFT SHOP FEAT. WANZ (OFFICIAL VIDEO)	Macklemore	QK8mJJJvaes	https://i.ytimg.com/vi/QK8mJJJvaes/hqdefault.jpg	\N	2026-01-15 18:06:30.853	2026-01-15 18:06:30.853
03efc4bf-2808-4aa6-8797-35e8fabd272a	MACKLEMORE & RYAN LEWIS - DOWNTOWN (OFFICIAL MUSIC VIDEO)	Macklemore	JGhoLcsr8GA	https://i.ytimg.com/vi/JGhoLcsr8GA/hqdefault.jpg	\N	2026-01-15 18:06:36.302	2026-01-15 18:06:36.302
bcb706e5-6f4f-4eef-aceb-28ab29711175	The Foundations - Build Me Up Buttercup (Lyric Video)	The Foundations	hSofzQURQDk	https://i.ytimg.com/vi/hSofzQURQDk/hqdefault.jpg	\N	2026-01-15 18:06:41.54	2026-01-15 18:06:41.54
2cd88789-3c7a-4abb-967f-49f0f8f6922d	Otis Redding - My Girl	PerryCoxPF93	0iPtG_O8w8g	https://i.ytimg.com/vi/0iPtG_O8w8g/hqdefault.jpg	\N	2026-01-15 18:06:46.861	2026-01-15 18:06:46.861
2d822a81-2320-4e0b-a449-546ba097aa89	How Sweet It Is (To Be Loved by You) - Jr. Walker & The All Stars (1964)  (HD Quality)	mleroy	Akrcr16whB4	https://i.ytimg.com/vi/Akrcr16whB4/hqdefault.jpg	\N	2026-01-15 18:06:52.265	2026-01-15 18:06:52.265
9b53ac20-11be-431f-9c23-548f64e7a308	Beyoncé - Crazy In Love ft. JAY Z	BeyoncéVEVO	ViwtNLUqkMY	https://i.ytimg.com/vi/ViwtNLUqkMY/hqdefault.jpg	\N	2026-01-15 18:06:57.767	2026-01-15 18:06:57.767
df951742-c36f-4b9f-9cab-900b43446acc	Little Eva - Loco-motion(1962)	Sironaca	eKpVQm41f8Y	https://i.ytimg.com/vi/eKpVQm41f8Y/hqdefault.jpg	\N	2026-01-15 18:07:03.133	2026-01-15 18:07:03.133
1ec77380-1366-4eca-90fc-479a1c3fe343	Luis Fonsi, Daddy Yankee - Despacito (Remix) [Lyrics] Ft. Justin Bieber	Unique Sound	37kFBTbrjfg	https://i.ytimg.com/vi/37kFBTbrjfg/hqdefault.jpg	\N	2026-01-15 18:07:08.734	2026-01-15 18:07:08.734
c76e0845-d420-433a-87f1-07bdcbffe0ca	Selena Gomez - Bad Liar	SelenaGomezVEVO	NZKXkD6EgBk	https://i.ytimg.com/vi/NZKXkD6EgBk/hqdefault.jpg	\N	2026-01-15 18:07:14.048	2026-01-15 18:07:14.048
a31f76ae-22a9-46fd-a906-87a0dd3d3b7a	Alessia Cara - Wild Things (Official Video)	AlessiaCaraVEVO	De30ET0dQpQ	https://i.ytimg.com/vi/De30ET0dQpQ/hqdefault.jpg	\N	2026-01-15 18:07:19.383	2026-01-15 18:07:19.383
8605c6e2-6b49-4cdf-ae20-bec983b0cdf9	IV. Sweatpants	Childish Gambino - Topic	j_d2o-V5SgM	https://i.ytimg.com/vi/j_d2o-V5SgM/hqdefault.jpg	\N	2026-01-15 18:07:24.816	2026-01-15 18:07:24.816
863452f9-40e8-4d3a-a4a6-8da8fab3217d	Ex To See	Sam Hunt - Topic	sOHYvzYOw8E	https://i.ytimg.com/vi/sOHYvzYOw8E/hqdefault.jpg	\N	2026-01-15 18:07:30.26	2026-01-15 18:07:30.26
3519ace8-6efd-4e87-a541-35f052fdc1df	Sam Hunt - Break Up In A Small Town (Official Music Video)	SamHuntVEVO	YOb4VUgRqo0	https://i.ytimg.com/vi/YOb4VUgRqo0/hqdefault.jpg	\N	2026-01-15 18:07:35.569	2026-01-15 18:07:35.569
87c2de9d-1079-4914-b082-f04b390ec48c	Migos - Bad and Boujee ft Lil Uzi Vert [Official Video]	Migos ATL	S-sJp1FfG7Q	https://i.ytimg.com/vi/S-sJp1FfG7Q/hqdefault.jpg	\N	2026-01-15 18:07:40.983	2026-01-15 18:07:40.983
5cabe055-4dbd-4be8-ae51-80cf071072f7	Desiigner - Panda	DesiignerVEVO	E5ONTXHS2mM	https://i.ytimg.com/vi/E5ONTXHS2mM/hqdefault.jpg	\N	2026-01-15 18:07:46.478	2026-01-15 18:07:46.478
0c17e849-b092-4d1d-9c1f-fffa52f692b8	DRAM - Broccoli feat. Lil Yachty (Official Music Video)	DRAM	K44j-sb1SRY	https://i.ytimg.com/vi/K44j-sb1SRY/hqdefault.jpg	\N	2026-01-15 18:07:51.855	2026-01-15 18:07:51.855
3cb72a38-de93-4839-a1a7-7f1b40c47e44	Then He Kissed Me- The Crystals (HD)	SabolSlayer	MSkum4B162M	https://i.ytimg.com/vi/MSkum4B162M/hqdefault.jpg	\N	2026-01-15 18:07:57.203	2026-01-15 18:07:57.203
a5c4420c-4b35-48fd-bf6d-553dcff8557d	Avicii - Waiting For Love	AviciiOfficialVEVO	cHHLHGNpCSA	https://i.ytimg.com/vi/cHHLHGNpCSA/hqdefault.jpg	\N	2026-01-15 18:08:02.571	2026-01-15 18:08:02.571
fc0ef535-c80e-4d1e-b5b7-e14482d6e3f9	Kanye West - Gold Digger ft. Jamie Foxx	KanyeWestVEVO	6vwNcNOTVzY	https://i.ytimg.com/vi/6vwNcNOTVzY/hqdefault.jpg	\N	2026-01-15 18:08:13.188	2026-01-15 18:08:13.188
75f84b9b-6725-4c5d-8336-41737e7b859e	Travis Scott - Antidote (Official Video)	TravisScottVEVO	KnZ8h3MRuYg	https://i.ytimg.com/vi/KnZ8h3MRuYg/hqdefault.jpg	\N	2026-01-15 18:08:18.567	2026-01-15 18:08:18.567
2216dbce-1167-4086-88a7-2f26914371f2	Taylor Swift - I Knew You Were Trouble (Taylor's Version) (Lyric Video)	Taylor Swift	TqAollrUJdA	https://i.ytimg.com/vi/TqAollrUJdA/hqdefault.jpg	\N	2026-01-15 18:08:24	2026-01-15 18:08:24
858e9f8a-8184-4c57-aee4-8e2e1975a2ad	ZAYN, Taylor Swift - I Don’t Wanna Live Forever (Fifty Shades Darker)	Taylor Swift	7F37r50VUTQ	https://i.ytimg.com/vi/7F37r50VUTQ/hqdefault.jpg	\N	2026-01-15 18:08:29.384	2026-01-15 18:08:29.384
61239bb3-5c74-4e45-9adc-dbe20c5b4300	Taylor Swift - Bad Blood ft. Kendrick Lamar	Taylor Swift	QcIy9NiNbmo	https://i.ytimg.com/vi/QcIy9NiNbmo/hqdefault.jpg	\N	2026-01-15 18:08:34.917	2026-01-15 18:08:34.917
f5098bef-43d3-4a34-8741-2009b8465771	Martin Solveig & GTA - Intoxicated (Official Music Video)	Spinnin' Records	94Rq2TX0wj4	https://i.ytimg.com/vi/94Rq2TX0wj4/hqdefault.jpg	\N	2026-01-15 18:08:40.364	2026-01-15 18:08:40.364
2cf0c686-34af-471c-9222-b37ad7993fb6	Sage The Gemini - Gas Pedal (Remix) (Audio) ft. IamSu, Justin Bieber	SageTheGeminiVEVO	-sspUJ4DL2A	https://i.ytimg.com/vi/-sspUJ4DL2A/hqdefault.jpg	\N	2026-01-15 18:08:46.012	2026-01-15 18:08:46.012
a122d85e-2716-49b5-ae34-747446ac0f9e	NEEDTOBREATHE - "LET'S STAY HOME TONIGHT" [Official Audio]	NEEDTOBREATHE	wBFYMdUV8do	https://i.ytimg.com/vi/wBFYMdUV8do/hqdefault.jpg	\N	2026-01-15 18:08:51.415	2026-01-15 18:08:51.415
3a4f5f96-9841-443e-b28c-f48e812a9950	Billy Currington Good Direction	\N	DY9D01WPIN0	https://img.youtube.com/vi/DY9D01WPIN0/maxresdefault.jpg	\N	2026-01-16 00:15:40.501	2026-01-16 00:15:40.501
9288b7f5-dadf-47c8-b0e9-1fd1f43ad0c0	Flo Rida - GDFR ft. Sage The Gemini and Lookas [Official Video]	Flo Rida	F8Cg572dafQ	https://i.ytimg.com/vi/F8Cg572dafQ/hqdefault.jpg	\N	2026-01-15 18:08:56.822	2026-01-15 18:08:56.822
150da6d8-e514-4740-918b-6fea7b139b40	Mac Dre - Thizzle Dance (Music Video)	All Bay Music Magazine 	BbdpEPoN9Kw	https://i.ytimg.com/vi/BbdpEPoN9Kw/hqdefault.jpg	\N	2026-01-15 18:32:09.667	2026-01-15 18:32:09.667
010b7c2a-7dbd-40e4-8413-b9920ecd1c44	Keak Da Sneak "That Go" featuring Prodigy & The Alchemist	MNRK Music Group	Px1QfCXf384	https://i.ytimg.com/vi/Px1QfCXf384/hqdefault.jpg	\N	2026-01-15 18:32:15.055	2026-01-15 18:32:15.055
7e10095f-cab7-46ad-bd9a-a4fb613ec4c0	E-40 - Tell Me When To Go (Official Music Video) | Warner Records	Warner Records	2GZbaXdK8Js	https://i.ytimg.com/vi/2GZbaXdK8Js/hqdefault.jpg	\N	2026-01-15 18:32:20.489	2026-01-15 18:32:20.489
cdbe6c5e-7473-44db-98c0-34fe2a7dd22a	Stupid Doo-Doo-Dumb	Mac Dre - Topic	YKal-4dY75k	https://i.ytimg.com/vi/YKal-4dY75k/hqdefault.jpg	\N	2026-01-15 18:32:25.759	2026-01-15 18:32:25.759
e42e65cc-ce36-47c8-99b1-52033ca00e25	The Sideshow (feat. Too $hort & Mistah F.A.B.)	Traxamillion - Topic	fQMlt0sAr_M	https://i.ytimg.com/vi/fQMlt0sAr_M/hqdefault.jpg	\N	2026-01-15 18:32:31.321	2026-01-15 18:32:31.321
d66b170f-d779-4a78-a2fd-b7649a7db9fc	Goin Dumb (feat. Keak Da Sneak, Young Bay, G-Stack)	Too $hort - Topic	fTvHkAjAIUw	https://i.ytimg.com/vi/fTvHkAjAIUw/hqdefault.jpg	\N	2026-01-15 18:32:37.134	2026-01-15 18:32:37.134
58bdc3c5-ace1-4fa8-b553-08128d443ee2	Go Hard or Go Home (feat. Stressmatic of the Federation)	E-40 - Topic	_JhYevwXLRU	https://i.ytimg.com/vi/_JhYevwXLRU/hqdefault.jpg	\N	2026-01-15 18:32:42.507	2026-01-15 18:32:42.507
b04f3c70-dd6c-4d0a-af97-afe2664468bd	Mistah Fab Ft. Dem Hoodstars- Ghost Ride It 2	Eddie00112233	_kq0gurdyTo	https://i.ytimg.com/vi/_kq0gurdyTo/hqdefault.jpg	\N	2026-01-15 18:32:47.8	2026-01-15 18:32:47.8
b6262b1d-d345-4b66-9ddd-a26f43a3a11b	Mac Dre - Feeling Myself (Official Video)	Mac Dre ThizzEnt	zgcT4CHg4jI	https://i.ytimg.com/vi/zgcT4CHg4jI/hqdefault.jpg	\N	2026-01-15 18:32:53.271	2026-01-15 18:32:53.271
5228216e-59db-45bb-b3a7-8d82e53fbc86	Life's a Bitch	Mac Dre - Topic	A4QL-vTM3WA	https://i.ytimg.com/vi/A4QL-vTM3WA/hqdefault.jpg	\N	2026-01-15 18:32:58.466	2026-01-15 18:32:58.466
16ba1e4f-7459-4df8-9797-7e324ca2f941	MISTAH FAB "GHOST RIDE IT" OFFICIAL VIDEO DIR CUT	Rebel of America	xLvlGVNInw4	https://i.ytimg.com/vi/xLvlGVNInw4/hqdefault.jpg	\N	2026-01-15 18:33:03.714	2026-01-15 18:33:03.714
75c1f10f-eaee-4d4c-bfa1-0b513442f36e	The Script - Superheroes (Official Video)	TheScriptVEVO	WIm1GgfRz6M	https://i.ytimg.com/vi/WIm1GgfRz6M/hqdefault.jpg	\N	2026-01-15 18:40:16.547	2026-01-15 18:40:16.547
ebbf9eaf-014d-4283-b665-3266764023f0	Lana Del Rey - High By The Beach	LanaDelReyVEVO	QnxpHIl5Ynw	https://i.ytimg.com/vi/QnxpHIl5Ynw/hqdefault.jpg	\N	2026-01-15 18:40:22.16	2026-01-15 18:40:22.16
8ff50245-3d61-4814-a77b-5be73a29ffb2	The Script - Man On A Wire (Official Video)	TheScriptVEVO	QV62YRpIeUA	https://i.ytimg.com/vi/QV62YRpIeUA/hqdefault.jpg	\N	2026-01-15 18:40:27.576	2026-01-15 18:40:27.576
b46e4b8d-4eeb-48a9-92de-0208912b4ea8	Lana Del Rey - Born To Die	LanaDelReyVEVO	Bag1gUxuU0g	https://i.ytimg.com/vi/Bag1gUxuU0g/hqdefault.jpg	\N	2026-01-15 18:40:32.813	2026-01-15 18:40:32.813
5b752862-b189-4c8c-b43e-62c626e61d70	The Script - Never Seen Anything "Quite Like You" (Audio)	TheScriptVEVO	gDxdkSkkM0Q	https://i.ytimg.com/vi/gDxdkSkkM0Q/hqdefault.jpg	\N	2026-01-15 18:40:38.095	2026-01-15 18:40:38.095
b8830041-86fb-451e-a1a0-eb7edb5bcd77	Off To The Races	Lana Del Rey - Topic	k53aLj72MYE	https://i.ytimg.com/vi/k53aLj72MYE/hqdefault.jpg	\N	2026-01-15 18:40:43.269	2026-01-15 18:40:43.269
9d9a140d-5bac-4f45-a044-7c6a3bae7bdf	The Script - No Good In Goodbye (Official Video)	TheScriptVEVO	ho9xM9n2USA	https://i.ytimg.com/vi/ho9xM9n2USA/hqdefault.jpg	\N	2026-01-15 18:40:48.825	2026-01-15 18:40:48.825
ed715a5e-734e-4bc1-9b4b-174073fc0a0f	Lana Del Rey - Blue Jeans	LanaDelReyVEVO	JRWox-i6aAk	https://i.ytimg.com/vi/JRWox-i6aAk/hqdefault.jpg	\N	2026-01-15 18:40:54.154	2026-01-15 18:40:54.154
ec47ffc9-5369-4cbc-8d9a-f72915354699	The Script - Six Degrees of Separation (Official Video)	TheScriptVEVO	FCT6Mu-pOeE	https://i.ytimg.com/vi/FCT6Mu-pOeE/hqdefault.jpg	\N	2026-01-15 18:40:59.396	2026-01-15 18:40:59.396
af9d3677-a4a6-4cb0-bf81-524a455aaa81	Lana Del Rey - Video Games	LanaDelReyVEVO	cE6wxDqdOV0	https://i.ytimg.com/vi/cE6wxDqdOV0/hqdefault.jpg	\N	2026-01-15 18:41:04.68	2026-01-15 18:41:04.68
85e5456b-ff00-4846-abe9-ae99c083e4b2	The Script - Paint the Town Green (Audio)	TheScriptVEVO	SwoTjZKNKUY	https://i.ytimg.com/vi/SwoTjZKNKUY/hqdefault.jpg	\N	2026-01-15 18:41:10.012	2026-01-15 18:41:10.012
923b5126-f155-4663-a2c7-bccdcf901497	Lana Del Rey - National Anthem	LanaDelReyVEVO	sxDdEPED0h8	https://i.ytimg.com/vi/sxDdEPED0h8/hqdefault.jpg	\N	2026-01-15 18:41:15.403	2026-01-15 18:41:15.403
7517bbf1-3983-4861-8b17-a41045ce6cd4	The Script - If You Could See Me Now (Official Video)	TheScriptVEVO	SGlkwKA-t_4	https://i.ytimg.com/vi/SGlkwKA-t_4/hqdefault.jpg	\N	2026-01-15 18:41:20.836	2026-01-15 18:41:20.836
8b3b33ed-1b79-4eab-ae96-3c70f792f7a7	Lucky Ones	Lana Del Rey - Topic	c3JHH6Hc_io	https://i.ytimg.com/vi/c3JHH6Hc_io/hqdefault.jpg	\N	2026-01-15 18:41:26.241	2026-01-15 18:41:26.241
fabddb06-0a45-48ef-9ad4-9840c00f8147	The Script - The Man Who Can’t Be Moved (Official Video)	TheScriptVEVO	gS9o1FAszdk	https://i.ytimg.com/vi/gS9o1FAszdk/hqdefault.jpg	\N	2026-01-15 18:41:31.67	2026-01-15 18:41:31.67
4d53bbb2-487d-4c42-8d69-e86629df28b8	Cola	Lana Del Rey - Topic	lBakG7KtVZE	https://i.ytimg.com/vi/lBakG7KtVZE/hqdefault.jpg	\N	2026-01-15 18:41:36.894	2026-01-15 18:41:36.894
e46379bc-5568-48e1-b86c-cd02971b857f	The Script - Kaleidoscope (Audio)	TheScriptVEVO	LYp0DihChwo	https://i.ytimg.com/vi/LYp0DihChwo/hqdefault.jpg	\N	2026-01-15 18:41:42.158	2026-01-15 18:41:42.158
9e5c2511-884e-4776-93ed-af40b270654f	Lana Del Rey - West Coast (The Young Proffesionals Minimal Remix)	Andrey Grinyuk Studio	Mk75H_1JIEc	https://i.ytimg.com/vi/Mk75H_1JIEc/hqdefault.jpg	\N	2026-01-15 18:41:47.544	2026-01-15 18:41:47.544
3432c14e-4a96-4966-a53f-023c10da4921	The Script - Hall of Fame (Official Video) ft. will.i.am	TheScriptVEVO	mk48xRzuNvA	https://i.ytimg.com/vi/mk48xRzuNvA/hqdefault.jpg	\N	2026-01-15 18:41:52.87	2026-01-15 18:41:52.87
e76170d6-e702-4684-bbb0-2bfb90094fa6	Diet Mountain Dew	Lana Del Rey - Topic	sEetXo3R-aM	https://i.ytimg.com/vi/sEetXo3R-aM/hqdefault.jpg	\N	2026-01-15 18:41:58.241	2026-01-15 18:41:58.241
721493fc-3f8a-4d2a-b568-ca1f3e561df8	The Script - Give the Love Around (Audio)	TheScriptVEVO	6MeFkYh9K9Y	https://i.ytimg.com/vi/6MeFkYh9K9Y/hqdefault.jpg	\N	2026-01-15 18:42:04.075	2026-01-15 18:42:04.075
65644208-6680-4a97-b5a9-f5cc169beb3a	Lana Del Rey - Radio (Lyrics)	7clouds	2xFR65mv8CE	https://i.ytimg.com/vi/2xFR65mv8CE/hqdefault.jpg	\N	2026-01-15 18:42:09.582	2026-01-15 18:42:09.582
ecf24321-e54d-4420-91df-9a43fca040a9	The Script - No Words (Audio)	TheScriptVEVO	HDDfpfkIqMo	https://i.ytimg.com/vi/HDDfpfkIqMo/hqdefault.jpg	\N	2026-01-15 18:42:15.137	2026-01-15 18:42:15.137
cee6ef97-2c4f-453a-b4fd-3c27893aa430	Lana Del Rey - Freak	LanaDelReyVEVO	jq30l5-vBbo	https://i.ytimg.com/vi/jq30l5-vBbo/hqdefault.jpg	\N	2026-01-15 18:42:20.963	2026-01-15 18:42:20.963
591f4629-cd2b-47c8-b825-e3d0e356f99c	The Script - Millionaires (Official Video)	TheScriptVEVO	gV1-M4uRiiw	https://i.ytimg.com/vi/gV1-M4uRiiw/hqdefault.jpg	\N	2026-01-15 18:42:26.399	2026-01-15 18:42:26.399
ae9d7b40-98d2-4116-b538-163a584dee44	The Script - Before The Worst (Official Video)	TheScriptVEVO	6s0s_ZlwaOs	https://i.ytimg.com/vi/6s0s_ZlwaOs/hqdefault.jpg	\N	2026-01-15 18:42:37.263	2026-01-15 18:42:37.263
c304b7fd-6c82-4b10-9567-6df5b98987be	The Script - Talk You Down (Official Video)	TheScriptVEVO	Wwimgki3OIQ	https://i.ytimg.com/vi/Wwimgki3OIQ/hqdefault.jpg	\N	2026-01-15 18:42:47.904	2026-01-15 18:42:47.904
ae260d00-3019-4eb5-8f2b-9551c6a1254e	Lana Del Rey - Young and Beautiful	LanaDelReyVEVO	o_1aF54DO60	https://i.ytimg.com/vi/o_1aF54DO60/hqdefault.jpg	\N	2026-01-15 18:42:53.528	2026-01-15 18:42:53.528
a49ec601-ad8c-4875-9e3a-c4d2c02d400e	Steel Magnolia - Just By Being You (Halo and Wings)	SteelMagnoliaVEVO	0N2v9gRNcrg	https://i.ytimg.com/vi/0N2v9gRNcrg/hqdefault.jpg	\N	2026-01-15 19:07:15.332	2026-01-15 19:07:15.332
930e7e33-d1f9-488a-bd33-42a7e427d4a9	Kanye West - Homecoming	KanyeWestVEVO	LQ488QrqGE4	https://i.ytimg.com/vi/LQ488QrqGE4/hqdefault.jpg	\N	2026-01-15 19:07:20.649	2026-01-15 19:07:20.649
710ecb8c-25d9-4779-83a2-e530747d73ff	Lee Brice - Woman Like You (Official Music Video)	Curb Records	dbAp5nphTz4	https://i.ytimg.com/vi/dbAp5nphTz4/hqdefault.jpg	\N	2026-01-15 19:07:26.028	2026-01-15 19:07:26.028
83bafbfd-891a-48ee-950d-ec6580271c83	Lee Brice - Love Like Crazy (Official Music Video)	Lee Brice	fWhvS8ciEpQ	https://i.ytimg.com/vi/fWhvS8ciEpQ/hqdefault.jpg	\N	2026-01-15 19:07:31.529	2026-01-15 19:07:31.529
4fa951e8-5c04-4c56-9e18-1090cbeb7a8e	Drake White - Livin' The Dream (Lyric Video)	DrakeWhiteVEVO	f9li3iW25vU	https://i.ytimg.com/vi/f9li3iW25vU/hqdefault.jpg	\N	2026-01-15 19:07:37.042	2026-01-15 19:07:37.042
911a9cbc-31d3-4f09-8dee-f078fd77a009	Thompson Square - Are You Gonna Kiss Me Or Not (Official Video)	Thompson Square	FDUOcHg5ijg	https://i.ytimg.com/vi/FDUOcHg5ijg/hqdefault.jpg	\N	2026-01-15 19:07:42.632	2026-01-15 19:07:42.632
63adef14-5eb0-4450-a764-50ecd79be18a	Kip Moore - More Girls Like You (Official Music Video)	KipMooreVEVO	o7H-bSlLoqI	https://i.ytimg.com/vi/o7H-bSlLoqI/hqdefault.jpg	\N	2026-01-15 19:07:48.106	2026-01-15 19:07:48.106
799822fa-09d8-47e3-a28a-3f414ee634b3	Martin Garrix feat. Usher - Don't Look Down (Lyric Video)	Martin Garrix	HQfgW83kY0E	https://i.ytimg.com/vi/HQfgW83kY0E/hqdefault.jpg	\N	2026-01-15 19:07:53.716	2026-01-15 19:07:53.716
f680523a-dfc4-4cdf-a95a-c54708d7c696	Axwell Λ Ingrosso - Sun Is Shining	AxwellIngrossoVEVO	nbXgHAzUWB0	https://i.ytimg.com/vi/nbXgHAzUWB0/hqdefault.jpg	\N	2026-01-15 19:07:59.066	2026-01-15 19:07:59.066
66e4c304-9cee-46b8-a403-ed743d198693	All of Me (Tiësto's Birthday Treatment Remix - Radio Edit)	John Legend - Topic	gbtLqVoMWdQ	https://i.ytimg.com/vi/gbtLqVoMWdQ/hqdefault.jpg	\N	2026-01-15 19:08:04.711	2026-01-15 19:08:04.711
01a380d2-0a2c-42cf-a993-2fed1167f23a	Bruno Mars - I Just Might [Official Music Video]	Bruno Mars	mrV8kK5t0V8	https://i.ytimg.com/vi/mrV8kK5t0V8/hqdefault.jpg	\N	2026-01-15 20:03:50.27	2026-01-15 20:03:50.27
00eeac9c-db83-4d0a-b32d-26fdffbf3d15	Zach Bryan - Plastic Cigarette	Zach Bryan	MBWmVXzGdVs	https://i.ytimg.com/vi/MBWmVXzGdVs/hqdefault.jpg	\N	2026-01-15 20:03:50.315	2026-01-15 20:03:50.315
5dbc17d5-b99e-443a-965c-591f88d71f73	Robyn - Talk To Me (Official Music Video)	Robyn	VhxIcmhydos	https://i.ytimg.com/vi/VhxIcmhydos/hqdefault.jpg	\N	2026-01-15 20:03:50.354	2026-01-15 20:03:50.354
f548cd36-5691-4604-8472-bf8fe4aca69f	Ari Lennox - Twin Flame (Official Lyric Video)	Ari Lennox	8h2RR3aOBcs	https://i.ytimg.com/vi/8h2RR3aOBcs/hqdefault.jpg	\N	2026-01-15 20:03:50.39	2026-01-15 20:03:50.39
569423b2-a7f6-4bdb-bffc-41602ff824b1	Xavi, Carin León - La Morrita [Official Video].	Carin Leon	3i5LdqBngDU	https://i.ytimg.com/vi/3i5LdqBngDU/hqdefault.jpg	\N	2026-01-15 20:03:50.43	2026-01-15 20:03:50.43
3e7a1282-30bc-478f-964b-b9250ebd424f	Father John Misty - The Old Law (Official Audio)	Father John Misty	Qa9l0cMEOeM	https://i.ytimg.com/vi/Qa9l0cMEOeM/hqdefault.jpg	\N	2026-01-15 20:03:50.474	2026-01-15 20:03:50.474
e6c1252a-63cc-4e8f-934e-254c11d26d5c	Luke Combs - Sleepless in a Hotel Room (Official Studio Video)	LukeCombsVEVO	qCbFhjLU-aM	https://i.ytimg.com/vi/qCbFhjLU-aM/hqdefault.jpg	\N	2026-01-15 20:03:50.524	2026-01-15 20:03:50.524
b9458dd5-974e-4acb-9ba1-d0db7caac796	Black Veil Brides - Certainty	BVBArmyVEVO	3Dk9DI5C4Ss	https://i.ytimg.com/vi/3Dk9DI5C4Ss/hqdefault.jpg	\N	2026-01-15 20:03:50.572	2026-01-15 20:03:50.572
59b6057b-4dd5-4499-ad49-8ebeec9912cf	Me Crazy	HONGJOONG - Topic	VEPWL3mTuzw	https://i.ytimg.com/vi/VEPWL3mTuzw/hqdefault.jpg	\N	2026-01-15 20:03:50.614	2026-01-15 20:03:50.614
89afcbad-7e56-4078-a3a8-9e9fe40d6ba5	Junior H x Gael Valenzuela - MI GATA [Official Video]	Rancho Humilde	QcSk1JMF2y0	https://i.ytimg.com/vi/QcSk1JMF2y0/hqdefault.jpg	\N	2026-01-15 20:03:50.669	2026-01-15 20:03:50.669
a822def6-e342-429a-ba16-56fcf61fa217	Toxic	VALORANT - Topic	GS3xW94y5Tg	https://i.ytimg.com/vi/GS3xW94y5Tg/hqdefault.jpg	\N	2026-01-15 20:03:50.718	2026-01-15 20:03:50.718
c890f74a-c199-4e2d-be1a-f4858e0753a7	Rvssian, Moliy, Ayetian, Tyga - What i Like (Music Video) | Recovery Riddim	Rvssian	XKL_ETLPFh4	https://i.ytimg.com/vi/XKL_ETLPFh4/hqdefault.jpg	\N	2026-01-15 20:03:50.775	2026-01-15 20:03:50.775
c5279d14-4703-4f47-9d9b-8dea423b8ba5	Stephen Sanchez - Sweet Love	StephenSanchezVEVO	B62HyHDheIE	https://i.ytimg.com/vi/B62HyHDheIE/hqdefault.jpg	\N	2026-01-15 20:03:50.818	2026-01-15 20:03:50.818
fbecea43-e176-4d8c-88c1-58d3f472f9f8	Jason Aldean and Brittany Aldean - Easier Gone (Official Audio)	Jason Aldean	z6-DAXkRSgw	https://i.ytimg.com/vi/z6-DAXkRSgw/hqdefault.jpg	\N	2026-01-15 20:03:50.875	2026-01-15 20:03:50.875
30401d6d-6368-4717-a2c8-a1a65da0f923	Pressha	Jill Scott - Topic	KBowZg7eOgY	https://i.ytimg.com/vi/KBowZg7eOgY/hqdefault.jpg	\N	2026-01-15 20:03:50.924	2026-01-15 20:03:50.924
90c375f2-5036-42e7-a178-708c7b17589a	Alter Bridge -  Scales Are Falling (Official Video)	Alter Bridge	eAx0Td1lUy0	https://i.ytimg.com/vi/eAx0Td1lUy0/hqdefault.jpg	\N	2026-01-15 20:03:50.971	2026-01-15 20:03:50.971
cdb6fb79-e477-4a71-ab96-0e90a5bd3d68	Robin Schulz - Embers (Official Lyric Video)	Robin Schulz	6nTCGzy1dIU	https://i.ytimg.com/vi/6nTCGzy1dIU/hqdefault.jpg	\N	2026-01-15 20:03:51.021	2026-01-15 20:03:51.021
3e5a1e01-33e2-4df9-a07f-cf644378492f	DENNIS, L7NNON, Beéle - Loco Contigo (Lyric Video)	BeeleVEVO	ojFIFvp5eik	https://i.ytimg.com/vi/ojFIFvp5eik/hqdefault.jpg	\N	2026-01-15 20:03:51.078	2026-01-15 20:03:51.078
910dd6a3-c117-4a57-9b03-ea40e983d348	CeCe Winans – For Your Glory (Official Lyric Video) | Music Inspired by House of David [Season 2]	CeCe Winans	qGBnjSSxR9o	https://i.ytimg.com/vi/qGBnjSSxR9o/hqdefault.jpg	\N	2026-01-15 20:03:51.124	2026-01-15 20:03:51.124
11f2152f-cfb1-4a4b-9121-b6e2236a28d0	Mumford & Sons - The Banjo Song (Lyric Video)	Mumford & Sons	yMmRMtfSItQ	https://i.ytimg.com/vi/yMmRMtfSItQ/hqdefault.jpg	\N	2026-01-15 20:03:51.171	2026-01-15 20:03:51.171
e2178dbb-59bb-409f-a018-f58e41e4632d	HAVEN. feat. Kaitlin Aragon - I Run (David Guetta Remix) [Visualizer]	David Guetta	6NRbmlR8TIE	https://i.ytimg.com/vi/6NRbmlR8TIE/hqdefault.jpg	\N	2026-01-15 20:03:51.218	2026-01-15 20:03:51.218
89f08cbb-b8ba-48f1-bfe8-679c28952b84	Brandon Lake - When A Cowboy Prays (Music Video)	BrandonLakeVEVO	a-yNY11IoZw	https://i.ytimg.com/vi/a-yNY11IoZw/hqdefault.jpg	\N	2026-01-15 20:03:51.271	2026-01-15 20:03:51.271
a73e76be-34c6-4fcc-9348-b912c4a0ca54	JayO - History (feat. Jordan Adetunji) (Official Video)	JayO Again	uCqtvXBvQR8	https://i.ytimg.com/vi/uCqtvXBvQR8/hqdefault.jpg	\N	2026-01-15 20:03:51.337	2026-01-15 20:03:51.337
4c1a081a-ec62-4a37-b757-c03aaa47c967	Morrissey - Make-up is a Lie (Official Visualizer)	Warner Records	Fp7ULjb7S4Q	https://i.ytimg.com/vi/Fp7ULjb7S4Q/hqdefault.jpg	\N	2026-01-15 20:03:51.385	2026-01-15 20:03:51.385
caff4262-5c03-42c2-9b99-99d28d9911e8	KB, nobigdyl. - GOT A REASON (Music Video)	KBVEVO	qEZUSDKYDDE	https://i.ytimg.com/vi/qEZUSDKYDDE/hqdefault.jpg	\N	2026-01-15 20:03:51.434	2026-01-15 20:03:51.434
831611f0-0b01-45ea-94e0-511d1aa4d270	Juanes - Volverte A Ver	JuanesVEVO	ihE74nG8ioc	https://i.ytimg.com/vi/ihE74nG8ioc/hqdefault.jpg	\N	2026-01-15 20:04:17.022	2026-01-15 20:04:17.022
7364bd55-134e-4931-8d10-5e700730f0e7	Dua Lipa - Levitating Featuring DaBaby (Official Music Video)	Levitating Featuring DaBaby (Official Music Video)	TUVcZfQe-Kw	https://img.youtube.com/vi/TUVcZfQe-Kw/maxresdefault.jpg	\N	2026-01-16 00:14:31.788	2026-01-16 00:14:31.788
a4a1a85a-9165-426d-bfd6-0da33bfe52a4	The Weeknd - Blinding Lights (Official Video)	Blinding Lights (Official Video)	4NRXx6U8ABQ	https://img.youtube.com/vi/4NRXx6U8ABQ/maxresdefault.jpg	\N	2026-01-16 00:14:32.75	2026-01-16 00:14:32.75
d257aa7a-bc29-4b63-8c6d-0b4e3d6aacfb	Sia - Cheap Thrills (Performance Edit)	Cheap Thrills (Performance Edit)	31crA53Dgu0	https://img.youtube.com/vi/31crA53Dgu0/maxresdefault.jpg	\N	2026-01-16 00:14:33.526	2026-01-16 00:14:33.526
23a2c016-e6f2-4113-a364-4cc98dabc8b6	Mark Ronson - Uptown Funk (Official Video) ft. Bruno Mars	Uptown Funk (Official Video) ft. Bruno Mars	OPf0YbXqDm0	https://img.youtube.com/vi/OPf0YbXqDm0/maxresdefault.jpg	\N	2026-01-16 00:14:34.483	2026-01-16 00:14:34.483
5214a96c-52ef-4158-bca7-25e8be8f47a0	Ed Sheeran - Shape of You (Official Music Video)	Shape of You (Official Music Video)	JGwWNGJdvx8	https://img.youtube.com/vi/JGwWNGJdvx8/maxresdefault.jpg	\N	2026-01-16 00:14:35.838	2026-01-16 00:14:35.838
ffe50088-b364-4ad8-9c3f-71ba3af3ce22	Justin Bieber - Sorry (PURPOSE : The Movement)	Sorry (PURPOSE : The Movement)	fRh_vgS2dFE	https://img.youtube.com/vi/fRh_vgS2dFE/maxresdefault.jpg	\N	2026-01-16 00:14:36.912	2026-01-16 00:14:36.912
14e299da-c573-4f79-8d20-67cbef07616d	Dua Lipa - New Rules (Official Music Video)	New Rules (Official Music Video)	k2qgadSvNyU	https://img.youtube.com/vi/k2qgadSvNyU/maxresdefault.jpg	\N	2026-01-16 00:14:37.771	2026-01-16 00:14:37.771
82c679e1-1ee1-43f8-9c9d-2751b8d7506a	BTS (방탄소년단) &#39;Dynamite&#39; Official MV	\N	gdZLi9oWNZg	https://img.youtube.com/vi/gdZLi9oWNZg/maxresdefault.jpg	\N	2026-01-16 00:14:38.669	2026-01-16 00:14:38.669
efccfe24-fdfa-438e-b6f7-ee9d99d980ea	The Chainsmokers - Closer (Lyric) ft. Halsey	Closer (Lyric) ft. Halsey	PT2_F-1esPk	https://img.youtube.com/vi/PT2_F-1esPk/maxresdefault.jpg	\N	2026-01-16 00:14:39.728	2026-01-16 00:14:39.728
340231a0-31b2-42ed-bcb1-4a4392b8d1af	TONES AND I - DANCE MONKEY (OFFICIAL VIDEO)	DANCE MONKEY (OFFICIAL VIDEO)	q0hyYWKXF0Q	https://img.youtube.com/vi/q0hyYWKXF0Q/maxresdefault.jpg	\N	2026-01-16 00:14:40.682	2026-01-16 00:14:40.682
c823ee8f-de79-4581-bf52-800f3635e212	Katy Perry - Roar	Roar	CevxZvSJLk8	https://img.youtube.com/vi/CevxZvSJLk8/maxresdefault.jpg	\N	2026-01-16 00:14:41.642	2026-01-16 00:14:41.642
f56337e2-c66c-4c1f-b263-7b8414285544	OneRepublic - Counting Stars	Counting Stars	hT_nvWreIhg	https://img.youtube.com/vi/hT_nvWreIhg/maxresdefault.jpg	\N	2026-01-16 00:14:42.632	2026-01-16 00:14:42.632
00aebe5a-3474-4a4f-973a-2c5b4513c666	Fifth Harmony - Work from Home (Official Video) ft. Ty Dolla $ign	Work from Home (Official Video) ft. Ty Dolla $ign	5GL9JoH4Sws	https://img.youtube.com/vi/5GL9JoH4Sws/maxresdefault.jpg	\N	2026-01-16 00:14:43.535	2026-01-16 00:14:43.535
c17ae438-c4f7-4e18-902f-848723da44c3	Calvin Harris, Rihanna - This Is What You Came For (Official Video)	This Is What You Came For (Official Video)	kOkQ4T5WO9E	https://img.youtube.com/vi/kOkQ4T5WO9E/maxresdefault.jpg	\N	2026-01-16 00:14:44.457	2026-01-16 00:14:44.457
87c12120-66d7-42c0-b00d-8861e8ba9de9	The Chainsmokers &amp; Coldplay - Something Just Like This (Official Lyric Video)	Something Just Like This (Official Lyric Video)	FM7MFYoylVs	https://img.youtube.com/vi/FM7MFYoylVs/maxresdefault.jpg	\N	2026-01-16 00:14:45.166	2026-01-16 00:14:45.166
812f0fa9-79aa-4b21-b7aa-0eb3be1504dd	The Chainsmokers - Don&#39;t Let Me Down (Official Video) ft. Daya	Don&#39;t Let Me Down (Official Video) ft. Daya	Io0fBr1XBUA	https://img.youtube.com/vi/Io0fBr1XBUA/maxresdefault.jpg	\N	2026-01-16 00:14:46.251	2026-01-16 00:14:46.251
66ce6b75-05a2-4ea2-b91f-0202a581e23a	BLACKPINK - ‘Shut Down’ M/V	‘Shut Down’ M/V	POe9SOEKotk	https://img.youtube.com/vi/POe9SOEKotk/maxresdefault.jpg	\N	2026-01-16 00:14:47.155	2026-01-16 00:14:47.155
ca2f8807-2c84-48b2-99ff-c3f2628773bf	BTS (방탄소년단) &#39;Butter&#39; Official MV	\N	WMweEpGlu_U	https://img.youtube.com/vi/WMweEpGlu_U/maxresdefault.jpg	\N	2026-01-16 00:14:47.95	2026-01-16 00:14:47.95
65a97fb0-8b30-4721-8f5d-3ef2e9073167	Justin Bieber - What Do You Mean?	What Do You Mean?	DK_0jXPuIr0	https://img.youtube.com/vi/DK_0jXPuIr0/maxresdefault.jpg	\N	2026-01-16 00:14:48.797	2026-01-16 00:14:48.797
349e2114-c30d-4caf-91fe-1f30221780ad	Avicii - Wake Me Up (Official Video)	Wake Me Up (Official Video)	IcrbM1l_BoI	https://img.youtube.com/vi/IcrbM1l_BoI/maxresdefault.jpg	\N	2026-01-16 00:14:50.159	2026-01-16 00:14:50.159
29638a93-b941-461a-8446-0fe0eeb7f904	Billie Eilish - bad guy	bad guy	DyDfgMOUjCI	https://img.youtube.com/vi/DyDfgMOUjCI/maxresdefault.jpg	\N	2026-01-16 00:14:51.223	2026-01-16 00:14:51.223
0c1923c9-3835-4631-a17a-8b909fefaec8	Black Eyed Peas, J Balvin - RITMO (Bad Boys For Life) (Official Music Video)	RITMO (Bad Boys For Life) (Official Music Video)	EzKkl64rRbM	https://img.youtube.com/vi/EzKkl64rRbM/maxresdefault.jpg	\N	2026-01-16 00:14:52.274	2026-01-16 00:14:52.274
cd0492c7-edec-48d5-b7a1-7281873a03cd	Ariana Grande - no tears left to cry (Official Video)	no tears left to cry (Official Video)	ffxKSjUwKdU	https://img.youtube.com/vi/ffxKSjUwKdU/maxresdefault.jpg	\N	2026-01-16 00:14:53.23	2026-01-16 00:14:53.23
2986db1d-551b-4b27-80fd-e99780b92d02	Shawn Mendes - There&#39;s Nothing Holdin&#39; Me Back (Official Music Video)	There&#39;s Nothing Holdin&#39; Me Back (Official Music Video)	dT2owtxkU8k	https://img.youtube.com/vi/dT2owtxkU8k/maxresdefault.jpg	\N	2026-01-16 00:14:54.146	2026-01-16 00:14:54.146
2066e026-b23c-4be3-bb45-57cbafbc1fb7	Ed Sheeran - Bad Habits [Official Video]	Bad Habits [Official Video]	orJSJGHjBLI	https://img.youtube.com/vi/orJSJGHjBLI/maxresdefault.jpg	\N	2026-01-16 00:14:55.307	2026-01-16 00:14:55.307
e7933de2-f191-4e46-bd4d-1857e2d26323	Kenny Chesney - Summertime (Official Video)	Summertime (Official Video)	BWSn0JFRiPI	https://img.youtube.com/vi/BWSn0JFRiPI/maxresdefault.jpg	\N	2026-01-16 00:15:01.523	2026-01-16 00:15:01.523
ef8d97f3-2bb5-4915-b563-be9f18098502	Chris Janson - &quot;Buy Me A Boat&quot; (Official Video)	&quot;Buy Me A Boat&quot; (Official Video)	mQPjKSVe1tQ	https://img.youtube.com/vi/mQPjKSVe1tQ/maxresdefault.jpg	\N	2026-01-16 00:15:02.381	2026-01-16 00:15:02.381
7dd1126f-a268-4726-92a8-3e18d5289212	Little Big Town - Pontoon (Official Music Video)	Pontoon (Official Music Video)	V0O0nzkESTI	https://img.youtube.com/vi/V0O0nzkESTI/maxresdefault.jpg	\N	2026-01-16 00:15:03.164	2026-01-16 00:15:03.164
7913f3c8-add0-431a-ac11-82703693b573	Jimmy Buffet: Margaritaville	\N	CICf8xoLyG8	https://img.youtube.com/vi/CICf8xoLyG8/maxresdefault.jpg	\N	2026-01-16 00:15:04.121	2026-01-16 00:15:04.121
fc778412-f534-4177-a206-d789ffdb49e4	Alan Jackson - Chattahoochee (Official HD Video)	Chattahoochee (Official HD Video)	JW5UEW2kYvc	https://img.youtube.com/vi/JW5UEW2kYvc/maxresdefault.jpg	\N	2026-01-16 00:15:05.072	2026-01-16 00:15:05.072
0e5b885f-9e24-430b-bb08-7df871efaf65	Darius Rucker - Wagon Wheel (Official Music Video)	Wagon Wheel (Official Music Video)	hvKyBcCDOB4	https://img.youtube.com/vi/hvKyBcCDOB4/maxresdefault.jpg	\N	2026-01-16 00:15:06.145	2026-01-16 00:15:06.145
c0255c05-bfb4-4c41-98d8-ff4181065fdc	Jake Owen - Barefoot Blue Jean Night (Official Video)	Barefoot Blue Jean Night (Official Video)	aRh-vBOS-dU	https://img.youtube.com/vi/aRh-vBOS-dU/maxresdefault.jpg	\N	2026-01-16 00:15:07.261	2026-01-16 00:15:07.261
ae628a98-715e-4299-8412-dfa4881c13b7	Keith Urban - Long Hot Summer (Official Music Video)	Long Hot Summer (Official Music Video)	7dtfBxUTXRY	https://img.youtube.com/vi/7dtfBxUTXRY/maxresdefault.jpg	\N	2026-01-16 00:15:08.139	2026-01-16 00:15:08.139
cf7e85d5-eed7-4093-91bb-daa106aa023e	Little Big Town - Boondocks (Official Music Video)	Boondocks (Official Music Video)	skAOb_EUE_M	https://img.youtube.com/vi/skAOb_EUE_M/maxresdefault.jpg	\N	2026-01-16 00:15:09.075	2026-01-16 00:15:09.075
817d518d-decd-4949-9cc7-fa825f97b790	Merle Haggard - Seashores of Old Mexico	Seashores of Old Mexico	LPFlcZQH_FU	https://img.youtube.com/vi/LPFlcZQH_FU/maxresdefault.jpg	\N	2026-01-16 00:15:09.718	2026-01-16 00:15:09.718
660b3007-27a4-4bf0-b908-a93ca74396cc	The Cadillac Three Live - &#39;Hard Out Here for a Country Boy&#39;	&#39;Hard Out Here for a Country Boy&#39;	juLe09CkUaY	https://img.youtube.com/vi/juLe09CkUaY/maxresdefault.jpg	\N	2026-01-16 00:15:10.733	2026-01-16 00:15:10.733
8d1e1c79-d5eb-4d43-9c29-56d26f6b398a	Morgan Wallen - 7 Summers (Lyric Video)	7 Summers (Lyric Video)	Db_mZ_2gtLg	https://img.youtube.com/vi/Db_mZ_2gtLg/maxresdefault.jpg	\N	2026-01-16 00:15:11.612	2026-01-16 00:15:11.612
b09f4ee0-31f1-49af-81e2-f28525ff1c6e	Craig Morgan - Redneck Yacht Club (Music Video)	Redneck Yacht Club (Music Video)	uI7Ghu1FpnQ	https://img.youtube.com/vi/uI7Ghu1FpnQ/maxresdefault.jpg	\N	2026-01-16 00:15:12.665	2026-01-16 00:15:12.665
c0f50666-6ebe-4557-98a5-6f66e4bca3d4	Thomas Rhett - Vacation (Instant Grat Video)	Vacation (Instant Grat Video)	1GqhBP2Pp6o	https://img.youtube.com/vi/1GqhBP2Pp6o/maxresdefault.jpg	\N	2026-01-16 00:15:13.708	2026-01-16 00:15:13.708
d08b5285-5c6d-4a81-887d-c34b0e515d47	Florida Georgia Line - Sun Daze	Sun Daze	c8nY06Pt8Qw	https://img.youtube.com/vi/c8nY06Pt8Qw/maxresdefault.jpg	\N	2026-01-16 00:15:14.65	2026-01-16 00:15:14.65
e700c676-b145-4c2b-a1b2-60307e7570a0	Kenny Chesney, Uncle Kracker - When The Sun Goes Down (Official Video)	When The Sun Goes Down (Official Video)	eGLdbpmXrbQ	https://img.youtube.com/vi/eGLdbpmXrbQ/maxresdefault.jpg	\N	2026-01-16 00:15:15.593	2026-01-16 00:15:15.593
cdc6df50-3e41-482c-9d3a-db44a9451643	Kane Brown - Short Skirt Weather (Lyric Video)	Short Skirt Weather (Lyric Video)	aqMLLdbkM_4	https://img.youtube.com/vi/aqMLLdbkM_4/maxresdefault.jpg	\N	2026-01-16 00:15:16.516	2026-01-16 00:15:16.516
1cc21042-d4cd-4b84-ae6e-201632f8e42c	Florida Georgia Line - Cruise	Cruise	8PvebsWcpto	https://img.youtube.com/vi/8PvebsWcpto/maxresdefault.jpg	\N	2026-01-16 00:15:17.398	2026-01-16 00:15:17.398
b2ae19d9-844d-4402-9605-46bfe35ae5ae	Alan Jackson, Jimmy Buffett - It&#39;s Five O&#39; Clock Somewhere (Official HD Video)	It&#39;s Five O&#39; Clock Somewhere (Official HD Video)	BPCjC543llU	https://img.youtube.com/vi/BPCjC543llU/maxresdefault.jpg	\N	2026-01-16 00:15:18.467	2026-01-16 00:15:18.467
5a1cb123-e6b3-4c51-b33f-726d14b97131	Clint Black - Summer&#39;s Comin&#39; (Official Video)	Summer&#39;s Comin&#39; (Official Video)	bXkHYccKe6M	https://img.youtube.com/vi/bXkHYccKe6M/maxresdefault.jpg	\N	2026-01-16 00:15:19.288	2026-01-16 00:15:19.288
c63692b9-8dea-44e1-8f40-f86bb66c5477	Deana Carter - Strawberry Wine (Official Music Video)	Strawberry Wine (Official Music Video)	Up06CryWQpE	https://img.youtube.com/vi/Up06CryWQpE/maxresdefault.jpg	\N	2026-01-16 00:15:20.31	2026-01-16 00:15:20.31
899a7a94-9f12-4029-9717-bac8381d4430	Riley Green&#39;s Acoustic Cover of &#39;Cold Beer With Your Name On It&#39; Hurts So Good	\N	W8Amsxl_JEg	https://img.youtube.com/vi/W8Amsxl_JEg/maxresdefault.jpg	\N	2026-01-16 00:15:21.082	2026-01-16 00:15:21.082
6c489019-fdec-4b2f-af3a-310f7fddd66f	Joe Nichols - Sunny and 75 (Official Music Video)	Sunny and 75 (Official Music Video)	hZwVvwp8i-M	https://img.youtube.com/vi/hZwVvwp8i-M/maxresdefault.jpg	\N	2026-01-16 00:15:22.101	2026-01-16 00:15:22.101
f7ee3991-7e6e-4b10-864c-f1a89bb89e91	Faith Hill - Sunshine &amp; Summertime	Sunshine &amp; Summertime	j3b10MUBHvM	https://img.youtube.com/vi/j3b10MUBHvM/maxresdefault.jpg	\N	2026-01-16 00:15:22.807	2026-01-16 00:15:22.807
39c4b3e0-6881-49ea-8858-1c8f8975dc0b	Billy Currington - We Are Tonight (Official Music Video)	We Are Tonight (Official Music Video)	lJIB_s_7dcw	https://img.youtube.com/vi/lJIB_s_7dcw/maxresdefault.jpg	\N	2026-01-16 00:15:23.475	2026-01-16 00:15:23.475
63d45640-c97f-4a2f-bbe1-d66e79198b4a	Jake Owen - Beachin&#39; (Official Video)	Beachin&#39; (Official Video)	VwgCBRj3dn4	https://img.youtube.com/vi/VwgCBRj3dn4/maxresdefault.jpg	\N	2026-01-16 00:15:24.416	2026-01-16 00:15:24.416
08e00e65-2322-4dd5-a258-657321d54d56	Kid Rock - All Summer Long [Official Music Video]	All Summer Long [Official Music Video]	aSkFygPCTwE	https://img.youtube.com/vi/aSkFygPCTwE/maxresdefault.jpg	\N	2026-01-16 00:15:25.38	2026-01-16 00:15:25.38
f3ba5be2-79de-4f37-91d1-e76816bcc916	Eric Church - Springsteen (Official Music Video)	Springsteen (Official Music Video)	l2gGXlW6wSY	https://img.youtube.com/vi/l2gGXlW6wSY/maxresdefault.jpg	\N	2026-01-16 00:15:26.385	2026-01-16 00:15:26.385
f963ab27-7918-4d36-b760-55772313d7ff	Rascal Flatts - Summer Nights	Summer Nights	H3Q-LQQW6pA	https://img.youtube.com/vi/H3Q-LQQW6pA/maxresdefault.jpg	\N	2026-01-16 00:15:27.236	2026-01-16 00:15:27.236
c1da1fca-6620-45f0-857d-edb548a5516b	Jack Ingram - Barefoot And Crazy	Barefoot And Crazy	cyVs9y2-phs	https://img.youtube.com/vi/cyVs9y2-phs/maxresdefault.jpg	\N	2026-01-16 00:15:28.131	2026-01-16 00:15:28.131
ce8e84e3-ddd8-43b8-a0f9-5e7a0f3b2ba5	Watermelon Crawl	\N	Ht4FHWTeh-4	https://img.youtube.com/vi/Ht4FHWTeh-4/maxresdefault.jpg	\N	2026-01-16 00:15:29.32	2026-01-16 00:15:29.32
396a31cd-bb2f-4914-b12f-7ae55b678e64	Blake Shelton - Some Beach (Official Music Video)	Some Beach (Official Music Video)	JTT2LEyjdC4	https://img.youtube.com/vi/JTT2LEyjdC4/maxresdefault.jpg	\N	2026-01-16 00:15:30.285	2026-01-16 00:15:30.285
4e4ab533-3b58-40ae-afc0-083be62670c7	Old Dominion - I Was On a Boat That Day (Official Video)	I Was On a Boat That Day (Official Video)	nr5dMwKaLag	https://img.youtube.com/vi/nr5dMwKaLag/maxresdefault.jpg	\N	2026-01-16 00:15:31.632	2026-01-16 00:15:31.632
35e1873a-d976-45cc-ae7a-e997f253952b	Travis Tritt - It&#39;s a Great Day to Be Alive	It&#39;s a Great Day to Be Alive	-ZPOmMovvRg	https://img.youtube.com/vi/-ZPOmMovvRg/maxresdefault.jpg	\N	2026-01-16 00:15:32.523	2026-01-16 00:15:32.523
70cb95ff-e7b1-4dcc-a3fe-d8e56d658b69	Fishin&#39; In The Dark- Nitty Gritty Dirt Band with lyrics	\N	8u7-Ht05v2M	https://img.youtube.com/vi/8u7-Ht05v2M/maxresdefault.jpg	\N	2026-01-16 00:15:33.379	2026-01-16 00:15:33.379
ec7f331d-acce-41d1-82fd-6de5f3507ac1	Brothers Osborne - 21 Summer (Official Music Video)	21 Summer (Official Music Video)	_PKk62XccU0	https://img.youtube.com/vi/_PKk62XccU0/maxresdefault.jpg	\N	2026-01-16 00:15:34.181	2026-01-16 00:15:34.181
9b5771ae-8639-48ad-a48a-d4375e07e6f7	Dierks Bentley - Somewhere On A Beach (Official Music Video)	Somewhere On A Beach (Official Music Video)	JgpmFp2DViA	https://img.youtube.com/vi/JgpmFp2DViA/maxresdefault.jpg	\N	2026-01-16 00:15:35.054	2026-01-16 00:15:35.054
778b21ed-3a27-4f8c-96e9-ad0b58173f4d	Long Hot Summer Day	\N	WYXMnBMvtDw	https://img.youtube.com/vi/WYXMnBMvtDw/maxresdefault.jpg	\N	2026-01-16 00:15:35.922	2026-01-16 00:15:35.922
fc15f316-2d0a-4fe4-84e8-971f3281c09c	Rodney Atkins - Take A Back Road (Official)	Take A Back Road (Official)	-R9GrGheMRw	https://img.youtube.com/vi/-R9GrGheMRw/maxresdefault.jpg	\N	2026-01-16 00:15:36.731	2026-01-16 00:15:36.731
0302adb1-e1ad-4738-b050-7898673c89b6	Two Pina Coladas (Garth Brooks)	\N	wgYiUtWmY08	https://img.youtube.com/vi/wgYiUtWmY08/maxresdefault.jpg	\N	2026-01-16 00:15:37.63	2026-01-16 00:15:37.63
5514064a-8d87-4745-b303-0049150b7e54	Dierks Bentley - What Was I Thinkin&#39;	What Was I Thinkin&#39;	fTqra4YSsaM	https://img.youtube.com/vi/fTqra4YSsaM/maxresdefault.jpg	\N	2026-01-16 00:15:38.495	2026-01-16 00:15:38.495
fa31f326-10a8-49c8-be8b-20c677e76f3d	Tim McGraw - Something Like That (Official Music Video)	Something Like That (Official Music Video)	HYRFgWbalBE	https://img.youtube.com/vi/HYRFgWbalBE/maxresdefault.jpg	\N	2026-01-16 00:15:39.444	2026-01-16 00:15:39.444
e1d30b0b-9a34-47f9-b0a3-344d8ca5e07e	Sam Hunt - Body Like A Back Road (Official Lyric Video)	Body Like A Back Road (Official Lyric Video)	Fx-EfjsRcBk	https://img.youtube.com/vi/Fx-EfjsRcBk/maxresdefault.jpg	\N	2026-01-16 00:15:41.23	2026-01-16 00:15:41.23
c434609e-32bd-4f28-9df7-25e52f5d9668	Morgan Wallen - Up Down ft. Florida Georgia Line (Official Video)	Up Down ft. Florida Georgia Line (Official Video)	77qc4ZtufzM	https://img.youtube.com/vi/77qc4ZtufzM/maxresdefault.jpg	\N	2026-01-16 00:15:42.264	2026-01-16 00:15:42.264
bfafc1d1-aa7c-4026-b6a6-f75360af483e	Kenny Chesney - No Shoes, No Shirt, No Problems (Official Video)	No Shoes, No Shirt, No Problems (Official Video)	-01jhW_Yzhs	https://img.youtube.com/vi/-01jhW_Yzhs/maxresdefault.jpg	\N	2026-01-16 00:15:43.397	2026-01-16 00:15:43.397
0830a8b8-830e-4602-b95c-a43160354682	Luke Combs - Beer Never Broke My Heart (Official Video)	Beer Never Broke My Heart (Official Video)	7Lb9dq-JZFI	https://img.youtube.com/vi/7Lb9dq-JZFI/maxresdefault.jpg	\N	2026-01-16 00:15:44.191	2026-01-16 00:15:44.191
43101e0d-6c45-4005-9ffb-aa79d9016e3a	Lynyrd Skynyrd - Sweet Home Alabama	Sweet Home Alabama	ye5BuYf8q4o	https://img.youtube.com/vi/ye5BuYf8q4o/maxresdefault.jpg	\N	2026-01-16 00:15:45.024	2026-01-16 00:15:45.024
64f4b9a9-2b26-429e-b6c7-61cf0f0939a0	Zac Brown Band - Chicken Fried (Official Music Video) | The Foundation	Chicken Fried (Official Music Video) | The Foundation	e4ujS1er1r0	https://img.youtube.com/vi/e4ujS1er1r0/maxresdefault.jpg	\N	2026-01-16 00:15:45.9	2026-01-16 00:15:45.9
479b9ab6-c76b-4882-9656-e36c2985e4c6	Aaron Watson, &#39;Kiss That Girl Goodbye&#39; (Acoustic)	\N	QbQGU3VOJks	https://img.youtube.com/vi/QbQGU3VOJks/maxresdefault.jpg	\N	2026-01-16 00:15:46.549	2026-01-16 00:15:46.549
129bbd69-502f-43ac-b3f9-959ed58ddf6e	Sam Hunt - Hard To Forget (Official Music Video)	Hard To Forget (Official Music Video)	Wxhv_HsEIl4	https://img.youtube.com/vi/Wxhv_HsEIl4/maxresdefault.jpg	\N	2026-01-16 00:15:47.351	2026-01-16 00:15:47.351
2defeed0-49d6-46f2-b0d1-f2c2ba77edc3	Lee Brice - Parking Lot Party - Live on the Lot	Live on the Lot	mZPZkG_zY0s	https://img.youtube.com/vi/mZPZkG_zY0s/maxresdefault.jpg	\N	2026-01-16 00:15:48.075	2026-01-16 00:15:48.075
34419695-696f-4106-bb35-4036a23908db	The Book of Love - The Dutch Tenors	The Dutch Tenors	znGGAD66Oe0	https://img.youtube.com/vi/znGGAD66Oe0/maxresdefault.jpg	\N	2026-01-16 00:15:53.953	2026-01-16 00:15:53.953
d750e8b1-a479-4043-8411-eb5bbddc510f	John Legend - All of Me (Official Video)	All of Me (Official Video)	450p7goxZqg	https://img.youtube.com/vi/450p7goxZqg/maxresdefault.jpg	\N	2026-01-16 00:15:54.992	2026-01-16 00:15:54.992
ec3cde8f-6bb9-4e00-bed8-1b55dc14f8c0	Andrea Bocelli, Cecilia Bartoli - Pianissimo (Official Music Video)	Pianissimo (Official Music Video)	e_rvQkM0_lU	https://img.youtube.com/vi/e_rvQkM0_lU/maxresdefault.jpg	\N	2026-01-16 00:15:55.977	2026-01-16 00:15:55.977
4777e3a3-8cfd-49a6-835b-fb2ee9d84851	IL DIVO - The Power Of Love (La Fuerza Mayor) (Live Video)	The Power Of Love (La Fuerza Mayor) (Live Video)	-fN49TItkdQ	https://img.youtube.com/vi/-fN49TItkdQ/maxresdefault.jpg	\N	2026-01-16 00:15:56.904	2026-01-16 00:15:56.904
335787f2-13fc-4bc0-87dd-e05385ce559c	Hallelujah - The Dutch Tenors (covering Leonard Cohen)	The Dutch Tenors (covering Leonard Cohen)	vAjntVgKW2g	https://img.youtube.com/vi/vAjntVgKW2g/maxresdefault.jpg	\N	2026-01-16 00:15:57.722	2026-01-16 00:15:57.722
ad1efae3-fc41-4efe-a255-4d9a4d7df7a6	Bonnie Raitt - I Can&#39;t Make You Love Me	I Can&#39;t Make You Love Me	nW9Cu6GYqxo	https://img.youtube.com/vi/nW9Cu6GYqxo/maxresdefault.jpg	\N	2026-01-16 00:15:58.672	2026-01-16 00:15:58.672
0a777364-e33f-4b05-bea1-7e6cd9032b76	3 Doors Down - Here Without You (Official Music Video)	Here Without You (Official Music Video)	kPBzTxZQG5Q	https://img.youtube.com/vi/kPBzTxZQG5Q/maxresdefault.jpg	\N	2026-01-16 00:15:59.692	2026-01-16 00:15:59.692
5083e8de-44e8-4a31-b9b5-a0eb6b0defc2	Andrea Bocelli, Ed Sheeran - Amo Soltanto Te (Official Music Video) ft. Ed Sheeran	Amo Soltanto Te (Official Music Video) ft. Ed Sheeran	CZeciQCNU4c	https://img.youtube.com/vi/CZeciQCNU4c/maxresdefault.jpg	\N	2026-01-16 00:16:00.613	2026-01-16 00:16:00.613
21c05402-f486-409b-a272-9f7bbf824abc	2CELLOS - Love Story [OFFICIAL VIDEO]	Love Story [OFFICIAL VIDEO]	UdHopftQD3A	https://img.youtube.com/vi/UdHopftQD3A/maxresdefault.jpg	\N	2026-01-16 00:16:01.424	2026-01-16 00:16:01.424
7bdd492d-c0c9-459e-9331-5cdfcd4dda94	OG3NE - Love Letter | Strandgasten	Love Letter | Strandgasten	57k7H4Se6xI	https://img.youtube.com/vi/57k7H4Se6xI/maxresdefault.jpg	\N	2026-01-16 00:16:02.167	2026-01-16 00:16:02.167
3998303c-2ccd-4d60-b03d-4c6305d0e359	Matteo Bocelli - For You	For You	DWpEvB3Ip2g	https://img.youtube.com/vi/DWpEvB3Ip2g/maxresdefault.jpg	\N	2026-01-16 00:16:02.883	2026-01-16 00:16:02.883
b6a8905c-7b79-4b5a-bded-38794a028c3d	Josh Groban - You Raise Me Up (Official Music Video) [HD Remaster]	You Raise Me Up (Official Music Video) [HD Remaster]	aJxrX42WcjQ	https://img.youtube.com/vi/aJxrX42WcjQ/maxresdefault.jpg	\N	2026-01-16 00:16:03.901	2026-01-16 00:16:03.901
bcfc8b9f-4047-4132-a347-e3e8599390d3	Andrea Bocelli, Ellie Goulding - Return To Love (Official Music Video)	Return To Love (Official Music Video)	tLCdOc3IzCY	https://img.youtube.com/vi/tLCdOc3IzCY/maxresdefault.jpg	\N	2026-01-16 00:16:05.147	2026-01-16 00:16:05.147
31e89560-b9e6-4bc3-aa19-c5e002ea58e1	Lewis Capaldi - Someone You Loved	Someone You Loved	zABLecsR5UE	https://img.youtube.com/vi/zABLecsR5UE/maxresdefault.jpg	\N	2026-01-16 00:16:06.26	2026-01-16 00:16:06.26
63ad5568-a2a5-4642-b3f2-8f9e0650ec60	MercyMe - &quot;I Can Only Imagine&quot; Official Music Video	&quot;I Can Only Imagine&quot; Official Music Video	BRPGRdbGHSs	https://img.youtube.com/vi/BRPGRdbGHSs/maxresdefault.jpg	\N	2026-01-16 00:16:07.006	2026-01-16 00:16:07.006
ecd34771-921c-4002-aaaf-f8ee1e791c4e	IL DIVO - I Believe In You (Je Crois En Toi) (Live At The Greek Theatre)	I Believe In You (Je Crois En Toi) (Live At The Greek Theatre)	0qAHHSGVjFg	https://img.youtube.com/vi/0qAHHSGVjFg/maxresdefault.jpg	\N	2026-01-16 00:16:07.934	2026-01-16 00:16:07.934
ef457f77-4025-469b-b2a6-90465725bc7f	&#39;Til I Hear You Sing&#39; Music Video | Love Never Dies	\N	47dUc4iMAvQ	https://img.youtube.com/vi/47dUc4iMAvQ/maxresdefault.jpg	\N	2026-01-16 00:16:08.784	2026-01-16 00:16:08.784
b2542389-1140-4af3-b84c-533af5bbaed5	IL DIVO - Crying (Llorando) [Live In London 2011]	Crying (Llorando) [Live In London 2011]	v9PNqB99Uvc	https://img.youtube.com/vi/v9PNqB99Uvc/maxresdefault.jpg	\N	2026-01-16 00:16:09.684	2026-01-16 00:16:09.684
409b0638-8c64-47c0-9e26-4a5fb0e4bc07	Just Show Me How To Love You - The Maestro &amp; The European Pop Orchestra Live Performance Music Video	The Maestro &amp; The European Pop Orchestra Live Performance Music Video	U0-f15CkoHg	https://img.youtube.com/vi/U0-f15CkoHg/maxresdefault.jpg	\N	2026-01-16 00:16:10.389	2026-01-16 00:16:10.389
76b7d27c-c7ca-49fc-a298-7191e43a51cc	Perfect Symphony - The Dutch Tenors (covering Ed Sheeran)	The Dutch Tenors (covering Ed Sheeran)	okQHGcQT1Vo	https://img.youtube.com/vi/okQHGcQT1Vo/maxresdefault.jpg	\N	2026-01-16 00:16:11.409	2026-01-16 00:16:11.409
772400ba-4ecf-4958-add0-afbea99cf75b	Calum Scott - You Are The Reason (Official Video)	You Are The Reason (Official Video)	ShZ978fBl6Y	https://img.youtube.com/vi/ShZ978fBl6Y/maxresdefault.jpg	\N	2026-01-16 00:16:12.326	2026-01-16 00:16:12.326
95041ac6-d729-4463-b502-e79474d0fd70	Eva Cassidy - Songbird	Songbird	bTNLYeaL7No	https://img.youtube.com/vi/bTNLYeaL7No/maxresdefault.jpg	\N	2026-01-16 00:16:13.222	2026-01-16 00:16:13.222
f6f2ca38-142f-4607-bbf1-f6b5bdc7a065	Sam Smith - Stay With Me (Official Music Video)	Stay With Me (Official Music Video)	pB-5XG-DbAA	https://img.youtube.com/vi/pB-5XG-DbAA/maxresdefault.jpg	\N	2026-01-16 00:16:14.885	2026-01-16 00:16:14.885
2c9fcdac-afda-49a5-89d4-e075a7f76260	IL DIVO - Regresa a Mí (Unbreak My Heart) (Video)	Regresa a Mí (Unbreak My Heart) (Video)	DJNzmNB48no	https://img.youtube.com/vi/DJNzmNB48no/maxresdefault.jpg	\N	2026-01-16 00:16:15.788	2026-01-16 00:16:15.788
cfdafffb-6aa9-4c16-bc9a-d7b54d83f3ae	SIX the Musical - Don&#39;t Lose Ur Head (from the Studio Cast Recording)	Don&#39;t Lose Ur Head (from the Studio Cast Recording)	kAthQG1aKho	https://img.youtube.com/vi/kAthQG1aKho/maxresdefault.jpg	\N	2026-01-16 00:16:31.163	2026-01-16 00:16:31.163
a0570470-2333-46b4-943d-eef790acc025	&quot;I&#39;d Rather Be Me&quot; Official Music Video | Mean Girls on Broadway	Barrett Wilbert Weed, Original Broadway Cast of Mean Girls	B-dywz4L6Y8	https://img.youtube.com/vi/B-dywz4L6Y8/maxresdefault.jpg	\N	2026-01-16 00:16:37.814	2026-01-16 00:16:37.814
eb9fa57d-d7af-4f31-9b59-c1a803312209	SIX (featuring Samantha Pauly) - All You Wanna Do	All You Wanna Do	XMB3WIuocJY	https://img.youtube.com/vi/XMB3WIuocJY/maxresdefault.jpg	\N	2026-01-16 00:16:44.044	2026-01-16 00:16:44.044
6183d133-b9c6-45dc-9d72-7469df5430ad	&quot;Burn&quot; from HAMILTON	Phillipa Soo	ibiXMtfG6a8	https://img.youtube.com/vi/ibiXMtfG6a8/maxresdefault.jpg	\N	2026-01-16 00:16:50.427	2026-01-16 00:16:50.427
beb0d34d-4bf8-41fa-b4f5-43da9f2bd123	SIX the Musical - Ex Wives (from the Studio Cast Recording)	Ex Wives (from the Studio Cast Recording)	AgEJK6Vk8Ro	https://img.youtube.com/vi/AgEJK6Vk8Ro/maxresdefault.jpg	\N	2026-01-16 00:16:56.749	2026-01-16 00:16:56.749
51eda2a1-695d-4c95-9bad-51a793f197db	Candy Store	Kevin Murphy, Laurence O'Keefe, Jessica Keenan Wynn, Alice Lee, Elle McLemore	_57ZW9kq1X8	https://img.youtube.com/vi/_57ZW9kq1X8/maxresdefault.jpg	\N	2026-01-16 00:17:03.194	2026-01-16 00:17:03.194
233e3530-6f4d-4f32-ba04-3d975117076b	SIX - The MegaSIX	The MegaSIX	aepgA8dOct4	https://img.youtube.com/vi/aepgA8dOct4/maxresdefault.jpg	\N	2026-01-16 00:17:09.617	2026-01-16 00:17:09.617
e177a8b7-a74f-4ce7-a98c-d5ebaac4f5f2	Dead Mom - Sophia Anne Caruso	Sophia Anne Caruso	uk7EoYang6I	https://img.youtube.com/vi/uk7EoYang6I/maxresdefault.jpg	\N	2026-01-16 00:17:16.294	2026-01-16 00:17:16.294
d7d58245-256a-446c-90ec-356496340def	SIX the Musical - Six (from the Studio Cast Recording)	Six (from the Studio Cast Recording)	wTvRNwslYxA	https://img.youtube.com/vi/wTvRNwslYxA/maxresdefault.jpg	\N	2026-01-16 00:17:22.762	2026-01-16 00:17:22.762
80a08f6c-bf86-4f58-89ad-dc695dba3611	&quot;World Burn&quot; The Official Music Video | Mean Girls on Broadway	Taylor Louderman, Original Broadway Cast of Mean Girls	H8bn4w3mMrI	https://img.youtube.com/vi/H8bn4w3mMrI/maxresdefault.jpg	\N	2026-01-16 00:17:29.066	2026-01-16 00:17:29.066
f4363c1f-39e2-4f81-a841-06bc0573085d	SIX (featuring Adrianna Hicks) - No Way	No Way	_U1NlmniTMk	https://img.youtube.com/vi/_U1NlmniTMk/maxresdefault.jpg	\N	2026-01-16 00:17:35.794	2026-01-16 00:17:35.794
c6cc4d14-b72c-4afd-a62a-7e80e5b5b4a6	Done For	Jorge Rivera-Herrans, Talya Sindel	km6NITbLVHc	https://img.youtube.com/vi/km6NITbLVHc/maxresdefault.jpg	\N	2026-01-16 00:17:42.36	2026-01-16 00:17:42.36
5d83a5b4-1c52-40c1-a276-688f847ce6b7	SIX the Musical - Get Down (from the Studio Cast Recording)	Get Down (from the Studio Cast Recording)	m5xv7fyRFyI	https://img.youtube.com/vi/m5xv7fyRFyI/maxresdefault.jpg	\N	2026-01-16 00:17:48.839	2026-01-16 00:17:48.839
838b31d6-f054-41d2-8d68-7d673b443ad0	Wicked | What Is This Feeling	Ariana Grande, Cynthia Erivo	amgPXKrFZVg	https://img.youtube.com/vi/amgPXKrFZVg/maxresdefault.jpg	\N	2026-01-16 00:17:55.373	2026-01-16 00:17:55.373
79b87f4c-b825-4cb5-b88c-d66212d385e1	SIX - The One You&#39;ve Been Waiting For	The One You&#39;ve Been Waiting For	23DUZFtKeJw	https://img.youtube.com/vi/23DUZFtKeJw/maxresdefault.jpg	\N	2026-01-16 00:18:01.97	2026-01-16 00:18:01.97
c568e7af-a1d1-4203-bb6b-de39c661b668	&quot;Waving Through a Window&quot; from the DEAR EVAN HANSEN Original Broadway Cast Recording	Ben Platt, Original Broadway Cast of Dear Evan Hansen	kfnMvo87fQU	https://img.youtube.com/vi/kfnMvo87fQU/maxresdefault.jpg	\N	2026-01-16 00:18:08.833	2026-01-16 00:18:08.833
b74a32ef-94cc-4443-8f2b-99c6bc2ac3e9	SIX the Musical (featuring Natalie Paris) - Heart of Stone (from the Studio Cast Recording)	Heart of Stone (from the Studio Cast Recording)	wMY7nZHNp7U	https://img.youtube.com/vi/wMY7nZHNp7U/maxresdefault.jpg	\N	2026-01-16 00:18:15.52	2026-01-16 00:18:15.52
0cb2cf4c-0ae6-4892-a91a-d1c1aedc8a84	Satisfied - Hamilton (Original Cast 2016 - Live) [HD]	Live) [HD]	H7Dl0uZhPvs	https://img.youtube.com/vi/H7Dl0uZhPvs/maxresdefault.jpg	\N	2026-01-16 00:18:21.784	2026-01-16 00:18:21.784
5ed99cdf-052f-4c78-8e5a-f6f7234f2464	SIX the Musical - Haus of Holbein (from the Studio Cast Recording)	Haus of Holbein (from the Studio Cast Recording)	KbyNfnlPCn4	https://img.youtube.com/vi/KbyNfnlPCn4/maxresdefault.jpg	\N	2026-01-16 00:18:28.026	2026-01-16 00:18:28.026
2fa9221c-5a67-4e1b-8b57-45ef33b437e3	Say My Name Clip | Beetlejuice The Musical	Alex Brightman, Sophia Anne Caruso, Kerry Butler, Rob McClure	QMrt9demNeA	https://img.youtube.com/vi/QMrt9demNeA/maxresdefault.jpg	\N	2026-01-16 00:18:34.644	2026-01-16 00:18:34.644
8ae8cfe0-ed32-4bc2-b456-5f440e95eaff	I Don’t Need Your Love - Izuka Hoyle | SIX The Musical Lyric Video	Izuka Hoyle | SIX The Musical Lyric Video	-fE50gQEtGA	https://img.youtube.com/vi/-fE50gQEtGA/maxresdefault.jpg	\N	2026-01-16 00:18:41.094	2026-01-16 00:18:41.094
c0a97e7d-518a-48e9-a999-80e38c4725fd	I Know Him	Jonathan Groff	kkG-KT_Comw	https://img.youtube.com/vi/kkG-KT_Comw/maxresdefault.jpg	\N	2026-01-16 00:18:47.76	2026-01-16 00:18:47.76
f909f55c-7949-44e3-853d-db1a8cc865ca	SIX (featuring Adrianna Hicks) - &quot;But there&#39;s only one you need to hear from tonight...&quot;	&quot;But there&#39;s only one you need to hear from tonight...&quot;	G8HCVq8lii8	https://img.youtube.com/vi/G8HCVq8lii8/maxresdefault.jpg	\N	2026-01-16 00:18:54.103	2026-01-16 00:18:54.103
6458f82f-95c2-4914-8213-c47e0369a4ed	Sincerely Me - Michael Lee Brown, Mike Faist, Will Roland (Dear Evan Hansen)	Michael Lee Brown, Mike Faist, Will Roland (Dear Evan Hansen)	UxZkmGR5lpA	https://img.youtube.com/vi/UxZkmGR5lpA/maxresdefault.jpg	\N	2026-01-16 00:19:00.501	2026-01-16 00:19:00.501
74cc5329-49a1-41c6-a3f1-fe4860e5dcd7	Cell Block Tango	Catherine Zeta-Jones, Susan Misner, Deidre Goodwin, Denise Faye, Ekaterina Chtchelkanova, Mya Harrison, Taye Diggs	0c2bKZMxEQg	https://img.youtube.com/vi/0c2bKZMxEQg/maxresdefault.jpg	\N	2026-01-16 00:19:07.637	2026-01-16 00:19:07.637
7c1e4047-c397-44b4-9e49-8b5ca7a5bbce	&quot;Revenge Party&quot; | Mean Girls on Broadway	Grey Henson, Barrett Wilbert Weed, Erika Henningsen, Original Broadway Cast of Mean Girls	Yj9nQbcMBgk	https://img.youtube.com/vi/Yj9nQbcMBgk/maxresdefault.jpg	\N	2026-01-16 00:19:13.947	2026-01-16 00:19:13.947
35f2fbae-a90a-445c-a8ab-8ed4080e50d4	Wait for Me	André De Shields, Reeve Carney, Jewelle Blackman, Yvette Gonzalez-Nacer, Kay Trinidad, Kimberly Marable, Timothy Hughes, Hadestown Original Broadway Company, Malcolm Armwood, Jessie Shelton	9nKTH0zx_H8	https://img.youtube.com/vi/9nKTH0zx_H8/maxresdefault.jpg	\N	2026-01-16 00:19:20.805	2026-01-16 00:19:20.805
0bbef3b8-5295-49cd-8b02-3e295803ea07	“Apex Predator” | Mean Girls on Broadway	Barrett Wilbert Weed, Erika Henningsen, Original Broadway Cast of Mean Girls	WiIi7STG3e0	https://img.youtube.com/vi/WiIi7STG3e0/maxresdefault.jpg	\N	2026-01-16 00:19:27.311	2026-01-16 00:19:27.311
d3c9c6f9-66b4-4871-b8ca-a557ccb27fe7	“First Burn” [Official Video]	Ari Afsar, Julia Harriman, Lexi Lawson, Rachelle Ann Go, Shoba Narayan	r2ys-AimNbE	https://img.youtube.com/vi/r2ys-AimNbE/maxresdefault.jpg	\N	2026-01-16 00:19:33.807	2026-01-16 00:19:33.807
b15fb331-a62f-4ab9-ad3b-99a543ce5f5d	Take a Break - Hamilton (Original Cast 2016 - Live) [HD]	Live) [HD]	2G8q2To4IGU	https://img.youtube.com/vi/2G8q2To4IGU/maxresdefault.jpg	\N	2026-01-16 00:19:40.122	2026-01-16 00:19:40.122
26c7204a-a036-4cb9-88a8-da7fd30d55f6	SIX   Don&#39;t Lose Your Head with lyrics by Chook	SIX, Christina Modestou	rRfOFr9vmyM	https://img.youtube.com/vi/rRfOFr9vmyM/maxresdefault.jpg	\N	2026-01-16 00:21:19.357	2026-01-16 00:21:19.357
aa807dc9-45d3-4f73-8e2e-d048a39878d4	candy store   heathers the musical    world premiere cast recording	Kevin Murphy, Laurence O'Keefe, Jessica Keenan Wynn, Alice Lee, Elle McLemore	SepcHlutO0M	https://img.youtube.com/vi/SepcHlutO0M/maxresdefault.jpg	\N	2026-01-16 00:21:47.734	2026-01-16 00:21:47.734
2c4f3a40-2942-4e0b-9240-c423a3aa3594	&quot;World Burn&quot; | Mean Girls on Broadway	Taylor Louderman, Original Broadway Cast of Mean Girls	BWVRg6IOGWY	https://img.youtube.com/vi/BWVRg6IOGWY/maxresdefault.jpg	\N	2026-01-16 00:22:10.948	2026-01-16 00:22:10.948
4cf04b73-e053-4731-b5fc-b578db40bb5c	Lou Bega - Mambo No. 5 (A Little Bit of...)	Mambo No. 5 (A Little Bit of...)	EK_LN3XEcnw	https://img.youtube.com/vi/EK_LN3XEcnw/maxresdefault.jpg	\N	2026-01-16 00:44:23.313	2026-01-16 00:44:23.313
976d54c6-ff9c-4e22-aea9-bcf4bd88c07c	Baha Men - Who Let The Dogs Out (Official Video)	Who Let The Dogs Out (Official Video)	ojULkWEUsPs	https://img.youtube.com/vi/ojULkWEUsPs/maxresdefault.jpg	\N	2026-01-16 00:44:29.581	2026-01-16 00:44:29.581
52185ee1-971d-44b5-b44a-7d620d530f18	Rednex - Cotton Eye Joe (Official Music Video) [HD] - RednexMusic com	RednexMusic com	mOYZaiDZ7BM	https://img.youtube.com/vi/mOYZaiDZ7BM/maxresdefault.jpg	\N	2026-01-16 00:44:35.838	2026-01-16 00:44:35.838
7751c44b-4713-4555-b7ba-a5ac466e4971	Eiffel 65 - Blue (Da Ba Dee) [Gabry Ponte Ice Pop Mix] (Original Video with subtitles)	Blue (Da Ba Dee) [Gabry Ponte Ice Pop Mix] (Original Video with subtitles)	68ugkg9RePc	https://img.youtube.com/vi/68ugkg9RePc/maxresdefault.jpg	\N	2026-01-16 00:44:42.294	2026-01-16 00:44:42.294
c068ebcb-40dd-4c11-a8a2-afaf3213182a	M.C. Hammer - U Can&#39;t Touch This	U Can&#39;t Touch This	otCpCn0l4Wo	https://img.youtube.com/vi/otCpCn0l4Wo/maxresdefault.jpg	\N	2026-01-16 00:44:48.607	2026-01-16 00:44:48.607
e73d380f-060a-460d-b054-320b550011a5	Cartoons - Witch doctor (Radio Mix)	Witch doctor (Radio Mix)	LXxBkBxNwQg	https://img.youtube.com/vi/LXxBkBxNwQg/maxresdefault.jpg	\N	2026-01-16 00:44:55.061	2026-01-16 00:44:55.061
48478bbc-f76a-4606-ba28-29ddeb14aff9	Best Years Of Our Lives	Baha Men	-HhCUIoLxR0	https://img.youtube.com/vi/-HhCUIoLxR0/maxresdefault.jpg	\N	2026-01-16 00:45:01.322	2026-01-16 00:45:01.322
f23d8f1e-2be5-4bed-bab9-956f65ad7529	I Like To Move It	will.i.am	PLEQRIisP_Q	https://img.youtube.com/vi/PLEQRIisP_Q/maxresdefault.jpg	\N	2026-01-16 00:45:08.254	2026-01-16 00:45:08.254
13b66314-fcbe-4484-8e35-bac18c0ed507	DJ Casper | Cha Cha Slide (Hardino Mix)  |  Audio World	DJ Casper, Hardino	8HKkT3F7wVs	https://img.youtube.com/vi/8HKkT3F7wVs/maxresdefault.jpg	\N	2026-01-16 00:45:14.503	2026-01-16 00:45:14.503
afb13f61-197f-4f55-86ae-f638b952b5f6	Aqua - Barbie Girl (Official Music Video)	Barbie Girl (Official Music Video)	ZyhrYis509A	https://img.youtube.com/vi/ZyhrYis509A/maxresdefault.jpg	\N	2026-01-16 00:45:20.694	2026-01-16 00:45:20.694
e4b4d65b-26d7-4fc4-a253-a2a3e3997df9	Smash Mouth - All Star	All Star	L_jWHffIx5E	https://img.youtube.com/vi/L_jWHffIx5E/maxresdefault.jpg	\N	2026-01-16 00:45:26.958	2026-01-16 00:45:26.958
3a9e4b58-c1f7-4179-b469-90fbb1065608	You All Dat	Baha Men	8ebiZlqQRRc	https://img.youtube.com/vi/8ebiZlqQRRc/maxresdefault.jpg	\N	2026-01-16 00:45:33.056	2026-01-16 00:45:33.056
30b6160f-43c1-4158-afd4-b76bba37df72	I Like to Move It (feat. The Mad Stuntman) (Erick &quot;More&quot; Album Mix)	Reel 2 Real, The Mad Stuntman, Erick Morillo	_NkpHLq76ro	https://img.youtube.com/vi/_NkpHLq76ro/maxresdefault.jpg	\N	2026-01-16 00:45:39.533	2026-01-16 00:45:39.533
a8d6c6f2-7de2-4dc5-b1e5-6a5eff0b3ac5	Scatman (ski-ba-bop-ba-dop-bop) Official Video HD - Scatman John	Scatman John	Hy8kmNEo1i8	https://img.youtube.com/vi/Hy8kmNEo1i8/maxresdefault.jpg	\N	2026-01-16 00:45:58.083	2026-01-16 00:45:58.083
64ff075b-1bf4-4cbc-8749-a68963a4c4cf	Spice Girls - Wannabe (Official Music Video)	Wannabe (Official Music Video)	gJLIiF15wjQ	https://img.youtube.com/vi/gJLIiF15wjQ/maxresdefault.jpg	\N	2026-01-16 00:46:04.606	2026-01-16 00:46:04.606
7dd7d8b3-1b67-4f5e-9b0f-bc1615b7aa18	Baha Men - Move It Like This [Video].VOB	Move It Like This [Video].VOB	IJs6fFugXpI	https://img.youtube.com/vi/IJs6fFugXpI/maxresdefault.jpg	\N	2026-01-16 00:46:10.738	2026-01-16 00:46:10.738
75f36047-896f-4438-ac5d-05f3c4211b0f	PSY - GANGNAM STYLE(강남스타일) M/V	GANGNAM STYLE(강남스타일) M/V	9bZkp7q19f0	https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg	\N	2026-01-16 00:46:17.054	2026-01-16 00:46:17.054
b535ade0-e31b-4928-ad14-bba78a779844	Jump Around (30 Years Remaster)	House Of Pain	Ps402yYQIm0	https://img.youtube.com/vi/Ps402yYQIm0/maxresdefault.jpg	\N	2026-01-16 00:46:23.495	2026-01-16 00:46:23.495
3eec2757-de11-45b4-9f82-c8f73240d6a5	Los Del Rio - Macarena (Bayside Boys Remix)	Macarena (Bayside Boys Remix)	zWaymcVmJ-A	https://img.youtube.com/vi/zWaymcVmJ-A/maxresdefault.jpg	\N	2026-01-16 00:46:29.644	2026-01-16 00:46:29.644
134e0bfb-dee8-45e7-8662-efce55e60efd	RUN DMC - It&#39;s Tricky (Official HD Video)	It&#39;s Tricky (Official HD Video)	l-O5IHVhWj0	https://img.youtube.com/vi/l-O5IHVhWj0/maxresdefault.jpg	\N	2026-01-16 00:46:35.743	2026-01-16 00:46:35.743
d6cf1d74-c6e8-4530-b06d-ded8baebd47f	Who Let The Dogs Out (Sped Up)	Baha Men, uSpeed, Cz.audios	bgj10Dq7SZw	https://img.youtube.com/vi/bgj10Dq7SZw/maxresdefault.jpg	\N	2026-01-16 00:46:42.206	2026-01-16 00:46:42.206
8cbb60c1-62f2-4dd6-ad38-bc37d41801fd	Space Jam	Quad City DJ's	gO3cFz53vs8	https://img.youtube.com/vi/gO3cFz53vs8/maxresdefault.jpg	\N	2026-01-16 00:46:48.334	2026-01-16 00:46:48.334
5400d57e-f3b2-48dd-917a-7f75730e0e64	Village People - YMCA (OFFICIAL Music Video 1978)	YMCA (OFFICIAL Music Video 1978)	CS9OO0S5w2k	https://img.youtube.com/vi/CS9OO0S5w2k/maxresdefault.jpg	\N	2026-01-16 00:46:54.518	2026-01-16 00:46:54.518
b786b366-4bb6-46e0-8179-5b1e33e2714b	Ylvis - The Fox (What Does The Fox Say?) [Official music video HD]	The Fox (What Does The Fox Say?) [Official music video HD]	jofNR_WkoCE	https://img.youtube.com/vi/jofNR_WkoCE/maxresdefault.jpg	\N	2026-01-16 00:47:00.766	2026-01-16 00:47:00.766
761e5bd4-e99e-4063-9b47-f22a259b1ed1	Right Said Fred - I&#39;m Too Sexy (Original Mix - 2006 Version)	2006 Version)	P5mtclwloEQ	https://img.youtube.com/vi/P5mtclwloEQ/maxresdefault.jpg	\N	2026-01-16 00:47:07.174	2026-01-16 00:47:07.174
66a6462f-78cc-4644-86e7-d5307ab337b0	Vanilla Ice - Ice Ice Baby (Official Music Video)	Ice Ice Baby (Official Music Video)	rog8ou-ZepE	https://img.youtube.com/vi/rog8ou-ZepE/maxresdefault.jpg	\N	2026-01-16 01:01:46.401	2026-01-16 01:01:46.401
70aeef96-aa39-4d3c-8f7b-8459f84f2cb3	Holla	Baha Men	lB-IIh0nZuM	https://img.youtube.com/vi/lB-IIh0nZuM/maxresdefault.jpg	\N	2026-01-16 01:02:56.819	2026-01-16 01:02:56.819
5a8f06d0-df28-4e55-a849-da31ffc77712	Smash Mouth - I&#39;m A Believer	I&#39;m A Believer	0mYBSayCsH0	https://img.youtube.com/vi/0mYBSayCsH0/maxresdefault.jpg	\N	2026-01-16 01:03:03.055	2026-01-16 01:03:03.055
01b317bf-6100-48ed-bc6f-2d7da1926174	The Black Eyed Peas - Let&#39;s Get It Started	Let&#39;s Get It Started	IKqV7DB8Iwg	https://img.youtube.com/vi/IKqV7DB8Iwg/maxresdefault.jpg	\N	2026-01-16 01:03:09.476	2026-01-16 01:03:09.476
188b4397-f01d-477a-8ad4-731e95480e6c	Snow - Informer (Official Music Video) [4K Remaster]	Informer (Official Music Video) [4K Remaster]	TSffz_bl6zo	https://img.youtube.com/vi/TSffz_bl6zo/maxresdefault.jpg	\N	2026-01-16 01:03:16.001	2026-01-16 01:03:16.001
\.

COPY public."Playlist" (id, name, description, "createdAt", "updatedAt", "userId", "autoUpdate", "sourceType", "sourceUrl", "lastSyncedAt", "expectedSongCount") FROM stdin;
56519b21-5ae2-4c0a-94d9-7496eb2bda33	My First Playlist	\N	2026-01-14 23:21:25.344	2026-01-14 23:21:25.344	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	\N	\N	\N	\N
f5d06198-aab4-4304-b562-80aaa50399da	Wedding Songs - Spotify	Imported from Spotify playlist	2026-01-15 19:11:22.291	2026-01-15 19:12:35.675	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/0bhed7IALXRcVilNQUUmhI	2026-01-15 19:11:28.154	\N
0563801c-4cad-45c9-a3c8-2b728c123d74	Bruno Mars - I Just Might [Official Music Video] - YouTube	Imported from YouTube playlist	2026-01-15 20:03:45.067	2026-01-15 20:03:51.449	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	youtube	https://www.youtube.com/watch?v=mrV8kK5t0V8&list=RDCLAK5uy_k5n4srrEB1wgvIjPNTXS9G1ufE9WQxhnA&index=2	2026-01-15 20:03:50.14	\N
c3c6bf3e-02fc-4825-9929-da69e9b46d0a	BAD BUNNY - DeBÍ TiRAR MáS FOToS - YouTube	Imported from YouTube playlist	2026-01-15 00:37:56.921	2026-01-15 17:54:51.865	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	youtube	\N	\N	\N
40ab41ee-0358-4e45-ac8c-8232f77e4583	Luis Fonsi, Demi Lovato - Échame La Culpa - YouTube	Imported from YouTube playlist	2026-01-15 00:36:32.634	2026-01-15 17:54:51.865	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	youtube	\N	\N	\N
239db9db-3431-4d76-8f5b-2b4697dca5c5	Your Library - Spotify	Imported from Spotify playlist	2026-01-15 01:57:09.923	2026-01-15 17:54:51.874	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	\N	\N	\N
745ce1dd-29eb-4810-be41-7d3dfea5b5df	Liked from Radio - Spotify	Imported from Spotify playlist	2026-01-15 02:04:39.927	2026-01-15 17:55:13.799	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/0crst7IaJAqxqDdxgVC4W7	2026-01-15 17:55:13.798	\N
ac17db97-7414-4768-b1fc-c8338e0c7b82	Starred - Spotify	Imported from Spotify playlist	2026-01-15 18:06:19.972	2026-01-15 18:06:25.508	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/6lRSHaXroPALRJDlBS2loj	2026-01-15 18:06:25.507	\N
5e84d420-c398-4481-9b66-83621de53755	Daily Mix 3 - Spotify	Imported from Spotify playlist	2026-01-15 20:04:05.233	2026-01-15 20:04:11.764	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/37i9dQZF1E374WgLBictb4	2026-01-15 20:04:11.763	30
f8511f9d-444e-4e29-92f3-1bb74cf78cc4	Chambea - Spotify	Imported from Spotify playlist	2026-01-15 18:14:32.204	2026-01-15 18:14:37.715	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/2C8mFJwULfmur5SXawW0N7	2026-01-15 18:14:37.714	\N
a14a6a3a-e146-4821-8515-9b41b0337a55	Thizz - Spotify	Imported from Spotify playlist	2026-01-15 18:31:58.883	2026-01-15 18:32:04.273	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/5YQAPqYwF49MN8YJzeW1ah	2026-01-15 18:32:04.273	\N
740f840f-8324-473c-8719-a458e4c3c9ee	Lana + The Script - Spotify	Imported from Spotify playlist	2026-01-15 18:40:05.83	2026-01-15 18:40:11.224	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	spotify	https://open.spotify.com/playlist/4GUFReCQQQP28MsXg2K9td	2026-01-15 18:40:11.224	\N
11f143f1-0d72-4daf-ac8f-cd77c438ee01	Another playlist	\N	2026-01-15 21:56:53.213	2026-01-15 21:56:53.213	a5d72513-90e2-4efe-ac6a-4a6766cf86aa	f	\N	\N	\N	\N
\.

COPY public."PlaylistSong" (id, "position", "createdAt", "playlistId", "songId") FROM stdin;
b93bc6a5-3a7b-427a-a3d2-5a304479f123	6	2026-01-15 19:11:57.176	f5d06198-aab4-4304-b562-80aaa50399da	710ecb8c-25d9-4779-83a2-e530747d73ff
fa76b85a-ffaf-4799-9970-c6172856504a	7	2026-01-15 20:03:50.577	0563801c-4cad-45c9-a3c8-2b728c123d74	b9458dd5-974e-4acb-9ba1-d0db7caac796
78116bdb-98a1-4c7c-a302-a96349b71e12	0	2026-01-15 00:36:32.641	40ab41ee-0358-4e45-ac8c-8232f77e4583	a1e3ed4b-a0d2-4960-8220-f21ec017aacd
b1e86799-50f1-4db4-9ff0-ba8f360612c3	1	2026-01-15 00:36:32.781	40ab41ee-0358-4e45-ac8c-8232f77e4583	75bb9061-0c43-42e4-b4e0-171da75fae11
002adddc-2cd2-411f-ad2f-cd7822946fdd	2	2026-01-15 00:36:32.82	40ab41ee-0358-4e45-ac8c-8232f77e4583	e9ed956a-a2ae-4e2d-9395-a75f4b5ff55d
601d4b26-7b28-4173-b44a-ec4bc57a42d5	3	2026-01-15 00:36:32.864	40ab41ee-0358-4e45-ac8c-8232f77e4583	b8dea9f3-7d83-4e3e-9ef4-8deef413b148
80d72e5c-19d9-4782-90d2-b7cd489edd8a	4	2026-01-15 00:36:32.905	40ab41ee-0358-4e45-ac8c-8232f77e4583	36bfb366-3c31-43ef-8c9f-9fc1f21043b3
5952e048-36e1-461a-b6eb-25ef2604c9a5	5	2026-01-15 00:36:32.951	40ab41ee-0358-4e45-ac8c-8232f77e4583	509ef999-d605-4376-8b85-d1841a1dd461
478201c2-2969-4885-a4b4-e02cc84a89d7	6	2026-01-15 00:36:32.997	40ab41ee-0358-4e45-ac8c-8232f77e4583	eef4f8bf-a9fa-4f4c-8457-6a9a7bb022f3
fc1ff814-2587-4457-9b1f-685e5fb1725d	7	2026-01-15 00:36:33.055	40ab41ee-0358-4e45-ac8c-8232f77e4583	8af623c3-4b39-4b40-93b5-73dcd3ddf9c3
03e7d34c-a174-45c7-844b-c03f70ff0d62	8	2026-01-15 00:36:33.099	40ab41ee-0358-4e45-ac8c-8232f77e4583	4e580803-ee19-405f-91b2-bd6e3d64e7a6
eca37e14-af26-4a28-849a-00ebec9c05a2	9	2026-01-15 00:36:33.149	40ab41ee-0358-4e45-ac8c-8232f77e4583	09867450-f63c-4d32-984d-19ce9c94d5ed
206168cb-0886-479a-b996-a36a7c351da0	10	2026-01-15 00:36:33.194	40ab41ee-0358-4e45-ac8c-8232f77e4583	feb1d143-4408-4a8f-995c-b86ec833eb6b
9a8e61ec-5c02-4683-9640-a01ec7afb00f	11	2026-01-15 00:36:33.232	40ab41ee-0358-4e45-ac8c-8232f77e4583	d02a3d31-43ae-4e4d-b96f-f461b507a322
72a77c1a-77eb-4111-9601-f1ee9488e72c	12	2026-01-15 00:36:33.274	40ab41ee-0358-4e45-ac8c-8232f77e4583	36d1a9ac-d3dc-43c7-995a-e9d4c6d9483e
4ce2de72-9323-465c-9a8e-a1d99add8aac	13	2026-01-15 00:36:33.316	40ab41ee-0358-4e45-ac8c-8232f77e4583	b022d4be-2896-42cd-abc4-365f876f64cc
b4d9b695-98b1-4df6-b581-c45b833d38a9	14	2026-01-15 00:36:33.362	40ab41ee-0358-4e45-ac8c-8232f77e4583	272ed9e9-0928-46de-90b4-f7e6bcaed4cc
4d94dd52-6caa-474b-a043-abf3f873fcb9	15	2026-01-15 00:36:33.412	40ab41ee-0358-4e45-ac8c-8232f77e4583	a2dfd5c6-bd69-43bc-bd2f-dc2528d855e4
0f7ef646-9b85-41c1-aa45-1d7675721a41	16	2026-01-15 00:36:33.417	40ab41ee-0358-4e45-ac8c-8232f77e4583	387ac98c-9147-41aa-ac0c-90b0c9fdfb16
eabce2fb-ba6b-420d-a090-c70d4a094f33	17	2026-01-15 00:36:33.477	40ab41ee-0358-4e45-ac8c-8232f77e4583	d6ff7f02-cb9e-492b-a736-c75ea69582ea
daad059a-b125-4e27-81bd-f1189a8f4687	18	2026-01-15 00:36:33.522	40ab41ee-0358-4e45-ac8c-8232f77e4583	3c0b57be-43be-4a5c-8978-e76f20974686
309c6592-0819-4fd9-a194-00227d802f85	19	2026-01-15 00:36:33.563	40ab41ee-0358-4e45-ac8c-8232f77e4583	7e3b2856-3532-4f01-a81e-759016192e35
1bf10ffc-4097-4eba-8d85-62c43ef3fb7d	20	2026-01-15 00:36:33.618	40ab41ee-0358-4e45-ac8c-8232f77e4583	2c0bd7d3-376e-45f1-9def-c96e0d673048
39fcb77f-aed6-4bfd-85df-348d06424c2f	21	2026-01-15 00:36:33.663	40ab41ee-0358-4e45-ac8c-8232f77e4583	64e90c94-18db-4f0b-a0d5-47563d8da9a0
55dbc740-241d-4029-9061-bd842287c2a3	22	2026-01-15 00:36:33.706	40ab41ee-0358-4e45-ac8c-8232f77e4583	669b58c1-5d80-47a4-b72d-487195804a5f
d499cc02-c28a-44c9-8d60-289969ebbccb	23	2026-01-15 00:36:33.747	40ab41ee-0358-4e45-ac8c-8232f77e4583	771772c4-9019-4739-8aa1-2d04ca75885a
4242ed01-5627-42b9-b28e-57ae6751b2c4	24	2026-01-15 00:36:33.788	40ab41ee-0358-4e45-ac8c-8232f77e4583	98b6ef6e-adb7-4573-bb23-dff1938cc4d3
f6388656-dc22-42c2-9fa5-3e50552c3f9c	0	2026-01-15 00:37:57.022	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	5a7d5e59-6cdf-4e42-8c48-541fb5cd27c1
c096aac7-b333-4459-91ff-a87364d0873d	1	2026-01-15 00:37:57.06	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	9f006a6f-0503-4b7c-b9af-044d682cd621
31484e03-2f2a-4e64-9f88-7b42374b72e2	2	2026-01-15 00:37:57.102	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	bcacad90-5545-4b17-acef-4fa96ba47890
4468c089-748c-4373-86d0-456d665da4b8	3	2026-01-15 00:37:57.141	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	9fdb4d17-2814-400a-8b82-76b914176d42
941baff4-5f6c-4172-b6ce-99ee2a7aed77	4	2026-01-15 00:37:57.181	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	afe06d11-f5c3-4d66-b081-8149596eee42
95879e1c-4c55-4ff8-9331-cc90630ea5bc	5	2026-01-15 00:37:57.222	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	4eabfae5-0a37-4bb0-a5da-fcb4c2e5c8c0
d78637de-958e-4b98-b5a1-f431b5d24f8a	6	2026-01-15 00:37:57.265	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	2819d299-e183-4e1a-b6a4-df324ac93d44
65132eea-edd8-4ce8-846f-e389a30e3f0b	7	2026-01-15 00:37:57.305	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	f7a8f7c8-960e-4077-bea4-d5aecdf05bcb
18f8cec8-a131-4e93-9126-cf071ceb5108	8	2026-01-15 00:37:57.344	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	3439715d-2b6e-43f7-a224-f4b039c6b8b8
a809fa27-83bf-4b58-8e7c-64e843d28096	9	2026-01-15 00:37:57.393	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	e8b3f770-c8c1-4e80-a597-90739dfb3de8
fa893cd5-18a7-449c-94a4-5e075b45f42a	10	2026-01-15 00:37:57.445	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	5a0e2400-7110-40f1-987f-69bb9991bc6b
1ae4c4dd-0827-4a36-8c82-3ca88641f93f	11	2026-01-15 00:37:57.485	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	1e3f37b5-2e14-4bf0-8ad3-aa2b3cba11b4
5a7ed147-e97b-4643-a312-778eb7e53977	12	2026-01-15 00:37:57.527	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	526ac2d8-b22c-4be6-a341-f1bfe534d630
fbdf9219-9d49-4bb8-86e4-ef065aa39e76	13	2026-01-15 00:37:57.572	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	83036e8c-63b1-41ed-a2d3-9b84ec95f2fc
476cf08f-110c-4eb4-bb45-597170a05149	14	2026-01-15 00:37:57.615	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	7d416bf2-9b34-441a-82cf-91801caa5106
0b5efede-05e9-45b6-84e0-bf575ccbeffd	15	2026-01-15 00:37:57.655	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	95678ae2-d6fd-4ca8-90e1-4422c681331d
299ef558-0d15-4e5e-a0f8-c420c60fffa4	16	2026-01-15 00:37:57.702	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	3d3eec36-1e42-48f7-96bc-488450a6df74
6b0ea1cd-0056-4f01-92a7-8be4101fff94	17	2026-01-15 00:37:57.743	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	ee8db240-6531-4fe2-be38-55d62836aa86
f23b30bc-ec11-44d1-840d-4df06e77ad20	3	2026-01-15 00:02:22.418	56519b21-5ae2-4c0a-94d9-7496eb2bda33	929d53f2-435d-448f-9324-c4c58649628a
9741ca04-81ab-4dd4-a24b-da0de90cb1ad	2	2026-01-15 00:02:20.555	56519b21-5ae2-4c0a-94d9-7496eb2bda33	387ac98c-9147-41aa-ac0c-90b0c9fdfb16
258135ef-e3b7-4cd4-8f5a-599936328bc5	18	2026-01-15 00:37:57.783	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	1329c9f2-5482-4eaa-9afd-b9020a533e3d
8b3d8f6b-95e4-4235-ac6b-76abc8848aa2	19	2026-01-15 00:37:57.843	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	0f8f113b-aa35-4eb0-8d2c-b10c369202c8
31fabcfb-9bb2-4ad3-8ddd-2d70ff953c3c	20	2026-01-15 00:37:57.882	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	6f35325c-6f91-4c21-835a-0f30a454162e
7f5733c5-cd7c-40d9-be2a-041574c76d34	21	2026-01-15 00:37:57.927	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	66e52c2e-4aae-436d-a07c-79a86882d4b2
18d12424-f29d-4510-ba22-dc75f4421d32	22	2026-01-15 00:37:57.969	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	5c37c1ce-d2fe-401f-b3f3-0549f3ffbef2
40cdddf9-1ef8-4ba7-96e8-6e10c5dfed68	23	2026-01-15 00:37:58.012	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	87159871-8f59-4667-9e34-af15dada151c
d6243fdd-aa0e-4e62-b9c3-39a3db3a8642	24	2026-01-15 00:37:58.057	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	30f10a24-1e5e-43a3-946d-995508b9e918
6382a1b3-3852-4627-8843-42d8e6fb8b65	25	2026-01-15 00:37:58.1	c3c6bf3e-02fc-4825-9929-da69e9b46d0a	93c48810-a299-4d76-90ea-5c72a06c0c8c
d355e463-6825-4d2c-aeea-c2f60ba234a0	0	2026-01-15 01:57:15.421	239db9db-3431-4d76-8f5b-2b4697dca5c5	7d35699d-9c11-47f1-9d45-d3f6731e6060
aa9fef05-95a6-4718-baac-45d7a64cb89d	1	2026-01-15 01:57:20.861	239db9db-3431-4d76-8f5b-2b4697dca5c5	2746124a-2992-46a8-be0f-030d7395c0ce
abd4260c-fdcd-4f09-97a6-a325c0d7dfd0	2	2026-01-15 01:57:26.372	239db9db-3431-4d76-8f5b-2b4697dca5c5	c82c23ee-2e0b-4105-8220-8964da6a422f
c0cfe89d-c6df-4dc4-aa44-8e574b325cc7	3	2026-01-15 01:57:31.698	239db9db-3431-4d76-8f5b-2b4697dca5c5	4d077a0b-02ca-4c8a-beb2-bfb9c4ae4472
a977cb6a-6525-45c8-be30-5922216e0c72	4	2026-01-15 01:57:37.083	239db9db-3431-4d76-8f5b-2b4697dca5c5	1bf144d9-bec7-4bf7-8e77-4da2c67523e5
d4b4e816-c0dd-4f50-b833-8adb1517be9c	5	2026-01-15 01:57:42.701	239db9db-3431-4d76-8f5b-2b4697dca5c5	a898dcef-0b5b-43d1-8bb3-9bae5600c87e
7ba94b9f-0986-4a7f-8eba-b3d9c04f9a98	6	2026-01-15 01:57:48.185	239db9db-3431-4d76-8f5b-2b4697dca5c5	49115c2a-9e51-435b-864e-109d8650193c
4882de00-ec76-4b1b-98bd-1109c8bd8d05	7	2026-01-15 01:57:54.06	239db9db-3431-4d76-8f5b-2b4697dca5c5	22654a31-ebc2-42dc-a8f7-7f257a85b5aa
5e3eb606-d0f1-4428-bc4c-de6419e288c8	8	2026-01-15 01:57:59.633	239db9db-3431-4d76-8f5b-2b4697dca5c5	d56b66e5-ae76-433c-a62e-56aaad1f3c09
5bf23ac7-6417-4c23-a402-54a04c507a79	9	2026-01-15 01:58:05.173	239db9db-3431-4d76-8f5b-2b4697dca5c5	0693ca7b-16de-4de6-a4f7-907243fe6d46
08622997-051e-4770-80ef-f8d362c72d82	10	2026-01-15 01:58:10.651	239db9db-3431-4d76-8f5b-2b4697dca5c5	f1d72316-df20-4e9c-9f77-2c13e8636e6d
a2a856ec-956a-4bbf-9a02-eb59d148cbb4	11	2026-01-15 01:58:16.101	239db9db-3431-4d76-8f5b-2b4697dca5c5	3ed9bbce-8d72-4481-9e4f-d75c5cde87ce
9f3ae9f8-b10b-4217-91ed-b4955b5a50ec	12	2026-01-15 01:58:21.547	239db9db-3431-4d76-8f5b-2b4697dca5c5	9810f00c-c1a7-4e09-bd3f-43392dfaecd4
a6d2c64f-f57f-47a4-bc08-d1eb31a2a77c	13	2026-01-15 01:58:27.016	239db9db-3431-4d76-8f5b-2b4697dca5c5	3ea840e1-035b-4eb7-a878-46eb4c3b112a
e455b7bd-c970-47e4-af05-f94d70342a78	0	2026-01-15 02:04:51.063	745ce1dd-29eb-4810-be41-7d3dfea5b5df	478b9231-6b77-4876-86fb-d82d869a21bb
ae1f4858-09f6-4085-93c3-2cf5c03af084	1	2026-01-15 02:04:56.888	745ce1dd-29eb-4810-be41-7d3dfea5b5df	37404216-13ce-45cd-9db0-d4370a0d6b2e
320bf51c-6ec4-482d-95d7-0ef28c7542fb	2	2026-01-15 17:24:16.461	745ce1dd-29eb-4810-be41-7d3dfea5b5df	7d35699d-9c11-47f1-9d45-d3f6731e6060
916fd8ae-fec0-42ed-a3f5-d79520b7a213	0	2026-01-15 18:06:30.855	ac17db97-7414-4768-b1fc-c8338e0c7b82	b26a0a15-086f-46e8-8fc2-c9327cb90b10
0480c0e0-dc6a-4e87-a6a2-b76411bedc99	1	2026-01-15 18:06:36.307	ac17db97-7414-4768-b1fc-c8338e0c7b82	03efc4bf-2808-4aa6-8797-35e8fabd272a
d4ce79ae-21ed-4ff2-8fc0-9576856d56d1	2	2026-01-15 18:06:41.545	ac17db97-7414-4768-b1fc-c8338e0c7b82	bcb706e5-6f4f-4eef-aceb-28ab29711175
85b18a37-a6ec-4d70-9a2e-6d8bb22e9d20	3	2026-01-15 18:06:46.866	ac17db97-7414-4768-b1fc-c8338e0c7b82	2cd88789-3c7a-4abb-967f-49f0f8f6922d
16014810-63db-40dc-8b87-ae4ba0132f59	4	2026-01-15 18:06:52.271	ac17db97-7414-4768-b1fc-c8338e0c7b82	2d822a81-2320-4e0b-a449-546ba097aa89
572eb5ac-8a43-4507-895e-820aa6dde658	5	2026-01-15 18:06:57.773	ac17db97-7414-4768-b1fc-c8338e0c7b82	9b53ac20-11be-431f-9c23-548f64e7a308
bc5f7bc8-e0e2-43b3-a535-35b121743b79	6	2026-01-15 18:07:03.138	ac17db97-7414-4768-b1fc-c8338e0c7b82	df951742-c36f-4b9f-9cab-900b43446acc
31c77466-262b-4be3-ae2e-fb647440189f	7	2026-01-15 18:07:08.74	ac17db97-7414-4768-b1fc-c8338e0c7b82	1ec77380-1366-4eca-90fc-479a1c3fe343
b72919e2-8395-4b15-bf12-ead185e43a1f	8	2026-01-15 18:07:14.053	ac17db97-7414-4768-b1fc-c8338e0c7b82	c76e0845-d420-433a-87f1-07bdcbffe0ca
3d034c37-9657-4365-bb2c-74f1dcb62ba5	9	2026-01-15 18:07:19.387	ac17db97-7414-4768-b1fc-c8338e0c7b82	a31f76ae-22a9-46fd-a906-87a0dd3d3b7a
06110b43-35ba-45a8-87fe-2cbb75b3e7a4	10	2026-01-15 18:07:24.822	ac17db97-7414-4768-b1fc-c8338e0c7b82	8605c6e2-6b49-4cdf-ae20-bec983b0cdf9
a0d2c7e7-f9fa-4ed6-b079-22baf5b73795	11	2026-01-15 18:07:30.265	ac17db97-7414-4768-b1fc-c8338e0c7b82	863452f9-40e8-4d3a-a4a6-8da8fab3217d
a0ae68b5-7c09-4a57-9922-9dd6f656d28f	12	2026-01-15 18:07:35.576	ac17db97-7414-4768-b1fc-c8338e0c7b82	3519ace8-6efd-4e87-a541-35f052fdc1df
d7b4cdce-20f9-4c19-99ce-47c483f194f6	13	2026-01-15 18:07:40.988	ac17db97-7414-4768-b1fc-c8338e0c7b82	87c2de9d-1079-4914-b082-f04b390ec48c
d46b0406-1d98-411a-9023-db8f97e1ef69	14	2026-01-15 18:07:46.487	ac17db97-7414-4768-b1fc-c8338e0c7b82	5cabe055-4dbd-4be8-ae51-80cf071072f7
e54700fa-5d4b-46f7-b7fe-21b54f0466e3	15	2026-01-15 18:07:51.861	ac17db97-7414-4768-b1fc-c8338e0c7b82	0c17e849-b092-4d1d-9c1f-fffa52f692b8
dfd2aeb1-3cdb-4500-999b-0241195cd5b2	16	2026-01-15 18:07:57.209	ac17db97-7414-4768-b1fc-c8338e0c7b82	3cb72a38-de93-4839-a1a7-7f1b40c47e44
f5495b17-5f6a-4272-a01b-badcf7168dd1	17	2026-01-15 18:08:02.578	ac17db97-7414-4768-b1fc-c8338e0c7b82	a5c4420c-4b35-48fd-bf6d-553dcff8557d
f69a21d1-e88b-471c-a18d-79ac57b9983c	19	2026-01-15 18:08:13.193	ac17db97-7414-4768-b1fc-c8338e0c7b82	fc0ef535-c80e-4d1e-b5b7-e14482d6e3f9
950458f0-76ff-4109-b8fd-ce8f0bb56021	20	2026-01-15 18:08:18.571	ac17db97-7414-4768-b1fc-c8338e0c7b82	75f84b9b-6725-4c5d-8336-41737e7b859e
a60b9691-8009-443d-a419-fcb2bf7c9d32	21	2026-01-15 18:08:24.002	ac17db97-7414-4768-b1fc-c8338e0c7b82	2216dbce-1167-4086-88a7-2f26914371f2
8bebe90b-9ec7-4643-8759-4c9c63a7ca76	22	2026-01-15 18:08:29.388	ac17db97-7414-4768-b1fc-c8338e0c7b82	858e9f8a-8184-4c57-aee4-8e2e1975a2ad
ce9bfb29-fb41-4d9b-bc30-cdd729a739f8	23	2026-01-15 18:08:34.921	ac17db97-7414-4768-b1fc-c8338e0c7b82	61239bb3-5c74-4e45-9adc-dbe20c5b4300
e9073f34-56e5-4235-82de-ac3b015cd8c5	24	2026-01-15 18:08:40.369	ac17db97-7414-4768-b1fc-c8338e0c7b82	f5098bef-43d3-4a34-8741-2009b8465771
f8890416-a970-41b9-a876-1c3e7e1d68d8	25	2026-01-15 18:08:46.017	ac17db97-7414-4768-b1fc-c8338e0c7b82	2cf0c686-34af-471c-9222-b37ad7993fb6
a79f319e-79a1-4973-8dc7-f93d0f568a93	0	2026-01-15 19:12:02.37	f5d06198-aab4-4304-b562-80aaa50399da	83bafbfd-891a-48ee-950d-ec6580271c83
888365ce-2c73-44d9-a04f-a096064736e2	9	2026-01-15 20:03:50.675	0563801c-4cad-45c9-a3c8-2b728c123d74	89afcbad-7e56-4078-a3a8-9e9fe40d6ba5
b0177f7c-d5d9-4623-ba26-b55785c9766f	26	2026-01-15 18:08:51.419	ac17db97-7414-4768-b1fc-c8338e0c7b82	a122d85e-2716-49b5-ae34-747446ac0f9e
70656d1b-44e4-4d53-b40d-e56f9a1cde3c	27	2026-01-15 18:08:56.828	ac17db97-7414-4768-b1fc-c8338e0c7b82	9288b7f5-dadf-47c8-b0e9-1fd1f43ad0c0
14671cf4-86f9-4a73-9ff0-e7467aa13505	7	2026-01-15 19:12:07.737	f5d06198-aab4-4304-b562-80aaa50399da	4fa951e8-5c04-4c56-9e18-1090cbeb7a8e
ecac5920-683f-481d-974e-8f974e58e901	15	2026-01-15 20:03:50.976	0563801c-4cad-45c9-a3c8-2b728c123d74	90c375f2-5036-42e7-a178-708c7b17589a
578ce360-4cf2-437e-9345-c7e0d72ba19c	0	2026-01-15 18:14:42.854	f8511f9d-444e-4e29-92f3-1bb74cf78cc4	7d35699d-9c11-47f1-9d45-d3f6731e6060
d25a1b17-016d-4914-b97c-086feba5397d	1	2026-01-15 18:14:47.967	f8511f9d-444e-4e29-92f3-1bb74cf78cc4	2746124a-2992-46a8-be0f-030d7395c0ce
0d8ce752-22d5-4bea-ac06-75267ee69f10	2	2026-01-15 18:14:53.309	f8511f9d-444e-4e29-92f3-1bb74cf78cc4	c82c23ee-2e0b-4105-8220-8964da6a422f
becc3c4f-c373-48b0-a6e1-2c7f62f52512	0	2026-01-15 18:32:09.676	a14a6a3a-e146-4821-8515-9b41b0337a55	150da6d8-e514-4740-918b-6fea7b139b40
53976a49-ee00-4de2-84ef-260a93b23336	1	2026-01-15 18:32:15.06	a14a6a3a-e146-4821-8515-9b41b0337a55	010b7c2a-7dbd-40e4-8413-b9920ecd1c44
b4473d53-d25a-4893-a271-c3d10eae8322	2	2026-01-15 18:32:20.494	a14a6a3a-e146-4821-8515-9b41b0337a55	7e10095f-cab7-46ad-bd9a-a4fb613ec4c0
4499f872-0d9d-4ffd-8c80-448e263e1d3b	3	2026-01-15 18:32:25.765	a14a6a3a-e146-4821-8515-9b41b0337a55	cdbe6c5e-7473-44db-98c0-34fe2a7dd22a
d0280abf-99da-450d-a45b-2bcf521526c6	4	2026-01-15 18:32:31.324	a14a6a3a-e146-4821-8515-9b41b0337a55	e42e65cc-ce36-47c8-99b1-52033ca00e25
21cbdd1a-32b7-48ab-a6d9-c116a754731e	5	2026-01-15 18:32:37.139	a14a6a3a-e146-4821-8515-9b41b0337a55	d66b170f-d779-4a78-a2fd-b7649a7db9fc
57a61502-582b-4f47-9fcc-de3a7bc09340	6	2026-01-15 18:32:42.512	a14a6a3a-e146-4821-8515-9b41b0337a55	58bdc3c5-ace1-4fa8-b553-08128d443ee2
8d9befcb-fb43-4fba-bc8f-40519097f70f	7	2026-01-15 18:32:47.807	a14a6a3a-e146-4821-8515-9b41b0337a55	b04f3c70-dd6c-4d0a-af97-afe2664468bd
baf803f6-a2e0-4fe2-857c-48f027f46a32	8	2026-01-15 18:32:53.277	a14a6a3a-e146-4821-8515-9b41b0337a55	b6262b1d-d345-4b66-9ddd-a26f43a3a11b
45748650-082a-4012-b82b-9d78288e11d9	9	2026-01-15 18:32:58.472	a14a6a3a-e146-4821-8515-9b41b0337a55	5228216e-59db-45bb-b3a7-8d82e53fbc86
40a78954-ebe5-4d98-8f27-584ad693af21	10	2026-01-15 18:33:03.72	a14a6a3a-e146-4821-8515-9b41b0337a55	16ba1e4f-7459-4df8-9797-7e324ca2f941
9a62b2d9-280d-4626-9e20-2b0cad8708b7	25	2026-01-15 18:42:37.269	740f840f-8324-473c-8719-a458e4c3c9ee	ae9d7b40-98d2-4116-b538-163a584dee44
12f4473c-e892-4e77-93e9-1d2fad00e7b8	21	2026-01-15 18:42:09.588	740f840f-8324-473c-8719-a458e4c3c9ee	65644208-6680-4a97-b5a9-f5cc169beb3a
f2c40d02-5989-40bc-a2d3-07cca6109181	26	2026-01-15 18:42:47.911	740f840f-8324-473c-8719-a458e4c3c9ee	c304b7fd-6c82-4b10-9567-6df5b98987be
bddc593f-a6a1-4c11-a22f-a176c401111e	0	2026-01-15 18:40:27.582	740f840f-8324-473c-8719-a458e4c3c9ee	8ff50245-3d61-4814-a77b-5be73a29ffb2
8c5012c3-4d68-49f5-bff1-d9066982adbb	8	2026-01-15 18:40:59.402	740f840f-8324-473c-8719-a458e4c3c9ee	ec47ffc9-5369-4cbc-8d9a-f72915354699
0245c288-56e6-4292-8da5-a1b677ffaa10	27	2026-01-15 18:42:53.532	740f840f-8324-473c-8719-a458e4c3c9ee	ae260d00-3019-4eb5-8f2b-9551c6a1254e
f6bde3af-34d6-47a7-8e84-a72cb94cdc7c	10	2026-01-15 18:41:10.02	740f840f-8324-473c-8719-a458e4c3c9ee	85e5456b-ff00-4846-abe9-ae99c083e4b2
552099d9-28e5-4f46-ae88-589eb123c7d0	18	2026-01-15 18:41:52.875	740f840f-8324-473c-8719-a458e4c3c9ee	3432c14e-4a96-4966-a53f-023c10da4921
66ff66ea-1c86-45dc-9656-1f36dac37272	11	2026-01-15 18:41:15.407	740f840f-8324-473c-8719-a458e4c3c9ee	923b5126-f155-4663-a2c7-bccdcf901497
c2c13f97-d75b-43fb-b247-2a099550e8cf	7	2026-01-15 18:40:54.16	740f840f-8324-473c-8719-a458e4c3c9ee	ed715a5e-734e-4bc1-9b4b-174073fc0a0f
4c9afc54-27a5-40d3-89f8-089d32f280b1	3	2026-01-15 18:40:16.553	740f840f-8324-473c-8719-a458e4c3c9ee	75c1f10f-eaee-4d4c-bfa1-0b513442f36e
b8538322-27d4-45ac-884b-d3124c4be417	16	2026-01-15 18:41:42.165	740f840f-8324-473c-8719-a458e4c3c9ee	e46379bc-5568-48e1-b86c-cd02971b857f
40ca8581-ac8f-4a19-a3ca-99ea43164f38	13	2026-01-15 18:41:26.245	740f840f-8324-473c-8719-a458e4c3c9ee	8b3b33ed-1b79-4eab-ae96-3c70f792f7a7
650982d1-4d7b-4b8f-9bb4-b471b25400a1	5	2026-01-15 18:40:38.102	740f840f-8324-473c-8719-a458e4c3c9ee	5b752862-b189-4c8c-b43e-62c626e61d70
6474dd3d-9b27-4ad2-ad7e-b0615871cf73	14	2026-01-15 18:41:31.673	740f840f-8324-473c-8719-a458e4c3c9ee	fabddb06-0a45-48ef-9ad4-9840c00f8147
ebfb0a09-e04f-4466-ad4a-3d85e2d008bd	4	2026-01-15 18:40:22.164	740f840f-8324-473c-8719-a458e4c3c9ee	ebbf9eaf-014d-4283-b665-3266764023f0
85ae75a3-2ee9-4a95-bf40-78f9482a9983	2	2026-01-15 19:11:51.82	f5d06198-aab4-4304-b562-80aaa50399da	930e7e33-d1f9-488a-bd33-42a7e427d4a9
77cc40d7-93a7-4249-a6a7-e3555ccc3177	1	2026-01-15 19:11:33.5	f5d06198-aab4-4304-b562-80aaa50399da	bcb706e5-6f4f-4eef-aceb-28ab29711175
f6068f41-1c2c-412a-9288-20bf5cf83a95	4	2026-01-15 19:11:38.925	f5d06198-aab4-4304-b562-80aaa50399da	3cb72a38-de93-4839-a1a7-7f1b40c47e44
7ceff32a-5668-4bab-86e7-03be3fab7a20	0	2026-01-15 21:57:02.316	11f143f1-0d72-4daf-ac8f-cd77c438ee01	831611f0-0b01-45ea-94e0-511d1aa4d270
2aa4b7c9-0cc5-40db-b3d5-4c6e2ad20e34	1	2026-01-15 20:03:50.32	0563801c-4cad-45c9-a3c8-2b728c123d74	00eeac9c-db83-4d0a-b32d-26fdffbf3d15
ac79761e-fd2b-4b77-8840-c419ea4f5ace	2	2026-01-15 20:03:50.356	0563801c-4cad-45c9-a3c8-2b728c123d74	5dbc17d5-b99e-443a-965c-591f88d71f73
d1694e94-00a5-41ff-b699-0517dad3b417	20	2026-01-15 20:03:51.223	0563801c-4cad-45c9-a3c8-2b728c123d74	e2178dbb-59bb-409f-a018-f58e41e4632d
419ed183-48ac-495c-9479-a48b4c660527	22	2026-01-15 20:03:51.343	0563801c-4cad-45c9-a3c8-2b728c123d74	a73e76be-34c6-4fcc-9348-b912c4a0ca54
094f396b-5e5b-42f0-a861-422c9ef6f960	8	2026-01-15 19:12:19.686	f5d06198-aab4-4304-b562-80aaa50399da	63adef14-5eb0-4450-a764-50ecd79be18a
520c6880-2158-4fef-88c9-a1e565d49568	10	2026-01-15 19:12:24.959	f5d06198-aab4-4304-b562-80aaa50399da	799822fa-09d8-47e3-a28a-3f414ee634b3
a39a77f5-7cb9-4748-9367-3a399f1e594c	5	2026-01-15 19:12:30.129	f5d06198-aab4-4304-b562-80aaa50399da	f680523a-dfc4-4cdf-a95a-c54708d7c696
f54c6016-d113-40af-ac98-71da3223326c	11	2026-01-15 19:12:13.361	f5d06198-aab4-4304-b562-80aaa50399da	911a9cbc-31d3-4f09-8dee-f078fd77a009
e8d17077-e509-4bba-92a3-1200705b8648	9	2026-01-15 19:11:44.449	f5d06198-aab4-4304-b562-80aaa50399da	a49ec601-ad8c-4875-9e3a-c4d2c02d400e
9d05076b-7374-4bd0-b166-e37f936de044	3	2026-01-15 19:12:35.67	f5d06198-aab4-4304-b562-80aaa50399da	66e4c304-9cee-46b8-a403-ed743d198693
6ce12183-6585-41c8-b160-3979ceaf3b8e	23	2026-01-15 20:03:51.392	0563801c-4cad-45c9-a3c8-2b728c123d74	4c1a081a-ec62-4a37-b757-c03aaa47c967
fdee1d72-2c56-4043-ac8b-b1dde91e1246	24	2026-01-15 20:03:51.441	0563801c-4cad-45c9-a3c8-2b728c123d74	caff4262-5c03-42c2-9b99-99d28d9911e8
43f4caad-edf3-43db-92a8-afdc8613e55c	0	2026-01-15 20:04:17.029	5e84d420-c398-4481-9b66-83621de53755	831611f0-0b01-45ea-94e0-511d1aa4d270
6b164154-cdc9-4f6a-b54f-56e5efe59bea	4	2026-01-15 20:03:50.434	0563801c-4cad-45c9-a3c8-2b728c123d74	569423b2-a7f6-4bdb-bffc-41602ff824b1
3cb77e67-b50e-4f62-a71b-00501fbfb2fa	14	2026-01-15 20:03:50.93	0563801c-4cad-45c9-a3c8-2b728c123d74	30401d6d-6368-4717-a2c8-a1a65da0f923
72cf5ae4-3872-4a6c-8fdd-26c355f23930	13	2026-01-15 20:03:50.88	0563801c-4cad-45c9-a3c8-2b728c123d74	fbecea43-e176-4d8c-88c1-58d3f472f9f8
7dca47ba-399f-4674-8ab1-cbf6290a6263	10	2026-01-15 20:03:50.724	0563801c-4cad-45c9-a3c8-2b728c123d74	a822def6-e342-429a-ba16-56fcf61fa217
43494b70-136b-4166-b758-01bfe84b3ba7	16	2026-01-15 20:03:51.028	0563801c-4cad-45c9-a3c8-2b728c123d74	cdb6fb79-e477-4a71-ab96-0e90a5bd3d68
990a56f6-192d-42c0-a8d8-e231a3bc167c	11	2026-01-15 20:03:50.78	0563801c-4cad-45c9-a3c8-2b728c123d74	c890f74a-c199-4e2d-be1a-f4858e0753a7
f5b9c292-8852-4fbc-aabd-8f5bd72b7240	0	2026-01-15 20:03:50.277	0563801c-4cad-45c9-a3c8-2b728c123d74	01a380d2-0a2c-42cf-a993-2fed1167f23a
f252f7b1-c1f3-4fc5-8403-1c1900d0bc73	22	2026-01-15 18:42:15.142	740f840f-8324-473c-8719-a458e4c3c9ee	ecf24321-e54d-4420-91df-9a43fca040a9
dd71d506-ec07-41ee-af14-ee761cfc0ca6	0	2026-01-15 21:14:52.401	56519b21-5ae2-4c0a-94d9-7496eb2bda33	831611f0-0b01-45ea-94e0-511d1aa4d270
85133e33-c43d-473d-ae3b-c6ff0ae972ca	1	2026-01-15 21:14:53.748	56519b21-5ae2-4c0a-94d9-7496eb2bda33	11f2152f-cfb1-4a4b-9121-b6e2236a28d0
4a21b496-c784-4704-b367-91ddbad086e8	3	2026-01-15 20:03:50.394	0563801c-4cad-45c9-a3c8-2b728c123d74	f548cd36-5691-4604-8472-bf8fe4aca69f
597c2c62-6c26-4228-b75d-65dcec73a4a0	4	2026-01-15 21:12:32.057	56519b21-5ae2-4c0a-94d9-7496eb2bda33	4c1a081a-ec62-4a37-b757-c03aaa47c967
763bac9d-ca89-4850-aaa9-0f2be50728da	21	2026-01-15 20:03:51.278	0563801c-4cad-45c9-a3c8-2b728c123d74	89f08cbb-b8ba-48f1-bfe8-679c28952b84
37848ee0-dd1b-4740-8341-4feda31b4978	19	2026-01-15 20:03:51.177	0563801c-4cad-45c9-a3c8-2b728c123d74	11f2152f-cfb1-4a4b-9121-b6e2236a28d0
c424584c-7476-4d79-be2e-99ebe012e94d	18	2026-01-15 20:03:51.129	0563801c-4cad-45c9-a3c8-2b728c123d74	910dd6a3-c117-4a57-9b03-ea40e983d348
3ff02538-d237-406a-88c6-3ce90bbc44da	12	2026-01-15 20:03:50.824	0563801c-4cad-45c9-a3c8-2b728c123d74	c5279d14-4703-4f47-9d9b-8dea423b8ba5
70712a70-2d4c-4737-88e0-41a110bb64c5	6	2026-01-15 20:03:50.532	0563801c-4cad-45c9-a3c8-2b728c123d74	e6c1252a-63cc-4e8f-934e-254c11d26d5c
867008c2-8faa-4167-a960-b7c8395f8e5d	17	2026-01-15 20:03:51.086	0563801c-4cad-45c9-a3c8-2b728c123d74	3e5a1e01-33e2-4df9-a07f-cf644378492f
c346a1b8-bd40-48cc-94fb-20e2693dab2f	5	2026-01-15 20:03:50.481	0563801c-4cad-45c9-a3c8-2b728c123d74	3e7a1282-30bc-478f-964b-b9250ebd424f
8f849e86-c8d8-4c76-a89b-53bf58b1f517	1	2026-01-15 18:40:32.818	740f840f-8324-473c-8719-a458e4c3c9ee	b46e4b8d-4eeb-48a9-92de-0208912b4ea8
74ee74d7-3fd7-4fea-883d-a5c0b8a042d1	20	2026-01-15 18:42:04.083	740f840f-8324-473c-8719-a458e4c3c9ee	721493fc-3f8a-4d2a-b568-ca1f3e561df8
c67168a3-4fa2-455a-8c86-089b71da93b6	15	2026-01-15 18:41:36.9	740f840f-8324-473c-8719-a458e4c3c9ee	4d53bbb2-487d-4c42-8d69-e86629df28b8
3a45eb2c-d18d-4512-9813-bf4553e70a7f	8	2026-01-15 20:03:50.62	0563801c-4cad-45c9-a3c8-2b728c123d74	59b6057b-4dd5-4499-ad49-8ebeec9912cf
bff6a6c1-bbd2-4fcf-91ba-61f19e783d6a	5	2026-01-15 23:29:04.237	56519b21-5ae2-4c0a-94d9-7496eb2bda33	caff4262-5c03-42c2-9b99-99d28d9911e8
217b8740-cfa0-42dc-971e-c1eb73e4272d	1	2026-01-15 23:29:07.054	11f143f1-0d72-4daf-ac8f-cd77c438ee01	caff4262-5c03-42c2-9b99-99d28d9911e8
eed8bafc-ddd0-4b88-8d97-8d1543b4815e	19	2026-01-15 18:41:58.245	740f840f-8324-473c-8719-a458e4c3c9ee	e76170d6-e702-4684-bbb0-2bfb90094fa6
61bb2f0c-2c57-40ed-9237-b0f1a8e1e669	6	2026-01-15 18:40:48.83	740f840f-8324-473c-8719-a458e4c3c9ee	9d9a140d-5bac-4f45-a044-7c6a3bae7bdf
60ec9e19-1ef0-4f07-badb-4ed9776d5a37	2	2026-01-15 18:40:43.279	740f840f-8324-473c-8719-a458e4c3c9ee	b8830041-86fb-451e-a1a0-eb7edb5bcd77
4b6565d2-34e9-4710-ab60-6f3c73829482	9	2026-01-15 18:41:04.685	740f840f-8324-473c-8719-a458e4c3c9ee	af9d3677-a4a6-4cb0-bf81-524a455aaa81
a4d4d5fe-549a-454c-907d-f9fa851c1879	17	2026-01-15 18:41:47.548	740f840f-8324-473c-8719-a458e4c3c9ee	9e5c2511-884e-4776-93ed-af40b270654f
40a8c32f-0810-4179-8f3d-a34b99ff0910	24	2026-01-15 18:42:26.403	740f840f-8324-473c-8719-a458e4c3c9ee	591f4629-cd2b-47c8-b825-e3d0e356f99c
b52111ce-2491-4b01-80d7-3ceb00117e27	23	2026-01-15 18:42:20.967	740f840f-8324-473c-8719-a458e4c3c9ee	cee6ef97-2c4f-453a-b4fd-3c27893aa430
89e5e229-2f44-418e-90f0-3c5a2f29cc0d	12	2026-01-15 18:41:20.841	740f840f-8324-473c-8719-a458e4c3c9ee	7517bbf1-3983-4861-8b17-a41045ce6cd4
\.

COPY public."HomePageFeed" (id, genre, songs, "createdAt", "updatedAt", tagline, "playlistUrl", "sourceType") FROM stdin;
f42be902-9106-4f21-9891-bde396f486f6	Pump-Up Pop	["7364bd55-134e-4931-8d10-5e700730f0e7", "a4a1a85a-9165-426d-bfd6-0da33bfe52a4", "d257aa7a-bc29-4b63-8c6d-0b4e3d6aacfb", "23a2c016-e6f2-4113-a364-4cc98dabc8b6", "5214a96c-52ef-4158-bca7-25e8be8f47a0", "ffe50088-b364-4ad8-9c3f-71ba3af3ce22", "14e299da-c573-4f79-8d20-67cbef07616d", "82c679e1-1ee1-43f8-9c9d-2751b8d7506a", "efccfe24-fdfa-438e-b6f7-ee9d99d980ea", "340231a0-31b2-42ed-bcb1-4a4392b8d1af", "c823ee8f-de79-4581-bf52-800f3635e212", "f56337e2-c66c-4c1f-b263-7b8414285544", "00aebe5a-3474-4a4f-973a-2c5b4513c666", "c17ae438-c4f7-4e18-902f-848723da44c3", "87c12120-66d7-42c0-b00d-8861e8ba9de9", "812f0fa9-79aa-4b21-b7aa-0eb3be1504dd", "66ce6b75-05a2-4ea2-b91f-0202a581e23a", "ca2f8807-2c84-48b2-99ff-c3f2628773bf", "65a97fb0-8b30-4721-8f5d-3ef2e9073167", "349e2114-c30d-4caf-91fe-1f30221780ad", "29638a93-b941-461a-8446-0fe0eeb7f904", "0c1923c9-3835-4631-a17a-8b909fefaec8", "cd0492c7-edec-48d5-b7a1-7281873a03cd", "2986db1d-551b-4b27-80fd-e99780b92d02", "2066e026-b23c-4be3-bb45-57cbafbc1fb7"]	2026-01-16 00:20:54.555	2026-01-16 00:20:54.555	Elevate your mood (and your heart rate) with these pop anthems	https://www.youtube.com/playlist?list=RDCLAK5uy_mVJ3RRi_YBfUJnZnQxLAedQQcXHujbUcg&playnext=1&index=1	youtube
e5230e4e-c709-407c-a056-4edb6bfb50e8	Country Tailgate	["e7933de2-f191-4e46-bd4d-1857e2d26323", "ef8d97f3-2bb5-4915-b563-be9f18098502", "7dd1126f-a268-4726-92a8-3e18d5289212", "7913f3c8-add0-431a-ac11-82703693b573", "fc778412-f534-4177-a206-d789ffdb49e4", "0e5b885f-9e24-430b-bb08-7df871efaf65", "c0255c05-bfb4-4c41-98d8-ff4181065fdc", "ae628a98-715e-4299-8412-dfa4881c13b7", "cf7e85d5-eed7-4093-91bb-daa106aa023e", "817d518d-decd-4949-9cc7-fa825f97b790", "660b3007-27a4-4bf0-b908-a93ca74396cc", "8d1e1c79-d5eb-4d43-9c29-56d26f6b398a", "b09f4ee0-31f1-49af-81e2-f28525ff1c6e", "c0f50666-6ebe-4557-98a5-6f66e4bca3d4", "d08b5285-5c6d-4a81-887d-c34b0e515d47", "e700c676-b145-4c2b-a1b2-60307e7570a0", "cdc6df50-3e41-482c-9d3a-db44a9451643", "1cc21042-d4cd-4b84-ae6e-201632f8e42c", "b2ae19d9-844d-4402-9605-46bfe35ae5ae", "5a1cb123-e6b3-4c51-b33f-726d14b97131", "c63692b9-8dea-44e1-8f40-f86bb66c5477", "899a7a94-9f12-4029-9717-bac8381d4430", "6c489019-fdec-4b2f-af3a-310f7fddd66f", "f7ee3991-7e6e-4b10-864c-f1a89bb89e91", "39c4b3e0-6881-49ea-8858-1c8f8975dc0b", "63d45640-c97f-4a2f-bbe1-d66e79198b4a", "08e00e65-2322-4dd5-a258-657321d54d56", "f3ba5be2-79de-4f37-91d1-e76816bcc916", "f963ab27-7918-4d36-b760-55772313d7ff", "c1da1fca-6620-45f0-857d-edb548a5516b", "ce8e84e3-ddd8-43b8-a0f9-5e7a0f3b2ba5", "396a31cd-bb2f-4914-b12f-7ae55b678e64", "4e4ab533-3b58-40ae-afc0-083be62670c7", "35e1873a-d976-45cc-ae7a-e997f253952b", "70cb95ff-e7b1-4dcc-a3fe-d8e56d658b69", "ec7f331d-acce-41d1-82fd-6de5f3507ac1", "9b5771ae-8639-48ad-a48a-d4375e07e6f7", "778b21ed-3a27-4f8c-96e9-ad0b58173f4d", "fc15f316-2d0a-4fe4-84e8-971f3281c09c", "0302adb1-e1ad-4738-b050-7898673c89b6", "5514064a-8d87-4745-b303-0049150b7e54", "fa31f326-10a8-49c8-be8b-20c677e76f3d", "3a4f5f96-9841-443e-b28c-f48e812a9950", "e1d30b0b-9a34-47f9-b0a3-344d8ca5e07e", "c434609e-32bd-4f28-9df7-25e52f5d9668", "bfafc1d1-aa7c-4026-b6a6-f75360af483e", "0830a8b8-830e-4602-b95c-a43160354682", "43101e0d-6c45-4005-9ffb-aa79d9016e3a", "64f4b9a9-2b26-429e-b6c7-61cf0f0939a0", "479b9ab6-c76b-4882-9656-e36c2985e4c6", "129bbd69-502f-43ac-b3f9-959ed58ddf6e", "2defeed0-49d6-46f2-b0d1-f2c2ba77edc3"]	2026-01-16 00:20:59.604	2026-01-16 00:20:59.604	Get ready to tailgate with the best in country music	https://www.youtube.com/playlist?list=PLLDVfSPfze0tExFaJFV09hr_EnRYgi_Fo	youtube
f03f1ca3-da32-4152-915c-47149102eeeb	Cuffin Season	["34419695-696f-4106-bb35-4036a23908db", "d750e8b1-a479-4043-8411-eb5bbddc510f", "ec3cde8f-6bb9-4e00-bed8-1b55dc14f8c0", "4777e3a3-8cfd-49a6-835b-fb2ee9d84851", "335787f2-13fc-4bc0-87dd-e05385ce559c", "ad1efae3-fc41-4efe-a255-4d9a4d7df7a6", "0a777364-e33f-4b05-bea1-7e6cd9032b76", "5083e8de-44e8-4a31-b9b5-a0eb6b0defc2", "21c05402-f486-409b-a272-9f7bbf824abc", "7bdd492d-c0c9-459e-9331-5cdfcd4dda94", "3998303c-2ccd-4d60-b03d-4c6305d0e359", "b6a8905c-7b79-4b5a-bded-38794a028c3d", "bcfc8b9f-4047-4132-a347-e3e8599390d3", "31e89560-b9e6-4bc3-aa19-c5e002ea58e1", "63ad5568-a2a5-4642-b3f2-8f9e0650ec60", "ecd34771-921c-4002-aaaf-f8ee1e791c4e", "ef457f77-4025-469b-b2a6-90465725bc7f", "b2542389-1140-4af3-b84c-533af5bbaed5", "409b0638-8c64-47c0-9e26-4a5fb0e4bc07", "76b7d27c-c7ca-49fc-a298-7191e43a51cc", "772400ba-4ecf-4958-add0-afbea99cf75b", "95041ac6-d729-4463-b502-e79474d0fd70", "f6f2ca38-142f-4607-bbf1-f6b5bdc7a065", "2c9fcdac-afda-49a5-89d4-e075a7f76260"]	2026-01-16 00:21:04.527	2026-01-16 00:21:04.527	The perfect playlist for your cozy nights in	https://www.youtube.com/playlist?list=PLp6_QWqDFsYLj3jNSVoyxbqiDsOW4mtza	youtube
7a1072ea-539a-4ab6-b413-4ba6a51922b9	Six Mix	["26c7204a-a036-4cb9-88a8-da7fd30d55f6", "a0570470-2333-46b4-943d-eef790acc025", "eb9fa57d-d7af-4f31-9b59-c1a803312209", "6183d133-b9c6-45dc-9d72-7469df5430ad", "beb0d34d-4bf8-41fa-b4f5-43da9f2bd123", "aa807dc9-45d3-4f73-8e2e-d048a39878d4", "233e3530-6f4d-4f32-ba04-3d975117076b", "e177a8b7-a74f-4ce7-a98c-d5ebaac4f5f2", "d7d58245-256a-446c-90ec-356496340def", "2c4f3a40-2942-4e0b-9240-c423a3aa3594", "f4363c1f-39e2-4f81-a841-06bc0573085d", "c6cc4d14-b72c-4afd-a62a-7e80e5b5b4a6", "5d83a5b4-1c52-40c1-a276-688f847ce6b7", "838b31d6-f054-41d2-8d68-7d673b443ad0", "79b87f4c-b825-4cb5-b88c-d66212d385e1", "c568e7af-a1d1-4203-bb6b-de39c661b668", "b74a32ef-94cc-4443-8f2b-99c6bc2ac3e9", "0cb2cf4c-0ae6-4892-a91a-d1c1aedc8a84", "5ed99cdf-052f-4c78-8e5a-f6f7234f2464", "2fa9221c-5a67-4e1b-8b57-45ef33b437e3", "8ae8cfe0-ed32-4bc2-b456-5f440e95eaff", "c0a97e7d-518a-48e9-a999-80e38c4725fd", "f909f55c-7949-44e3-853d-db1a8cc865ca", "6458f82f-95c2-4914-8213-c47e0369a4ed", "74cc5329-49a1-41c6-a3f1-fe4860e5dcd7", "7c1e4047-c397-44b4-9e49-8b5ca7a5bbce", "35f2fbae-a90a-445c-a8ab-8ed4080e50d4", "0bbef3b8-5295-49cd-8b02-3e295803ea07", "d3c9c6f9-66b4-4871-b8ca-a557ccb27fe7", "b15fb331-a62f-4ab9-ad3b-99a543ce5f5d"]	2026-01-16 00:24:00.535	2026-01-16 00:24:00.535	Best songs from the Broadway hit Six	https://open.spotify.com/playlist/37i9dQZF1EIWYxA8zfXiSt	spotify
f324ed30-ad5d-4c9b-bea9-a3ec0bc952d4	Who Let the Dogs Out Radio	["4cf04b73-e053-4731-b5fc-b578db40bb5c", "976d54c6-ff9c-4e22-aea9-bcf4bd88c07c", "52185ee1-971d-44b5-b44a-7d620d530f18", "7751c44b-4713-4555-b7ba-a5ac466e4971", "c068ebcb-40dd-4c11-a8a2-afaf3213182a", "e73d380f-060a-460d-b054-320b550011a5", "48478bbc-f76a-4606-ba28-29ddeb14aff9", "f23d8f1e-2be5-4bed-bab9-956f65ad7529", "13b66314-fcbe-4484-8e35-bac18c0ed507", "afb13f61-197f-4f55-86ae-f638b952b5f6", "e4b4d65b-26d7-4fc4-a253-a2a3e3997df9", "3a9e4b58-c1f7-4179-b469-90fbb1065608", "30b6160f-43c1-4158-afd4-b76bba37df72", "66a6462f-78cc-4644-86e7-d5307ab337b0", "a8d6c6f2-7de2-4dc5-b1e5-6a5eff0b3ac5", "64ff075b-1bf4-4cbc-8749-a68963a4c4cf", "7dd7d8b3-1b67-4f5e-9b0f-bc1615b7aa18", "75f36047-896f-4438-ac5d-05f3c4211b0f", "b535ade0-e31b-4928-ad14-bba78a779844", "3eec2757-de11-45b4-9f82-c8f73240d6a5", "134e0bfb-dee8-45e7-8662-efce55e60efd", "d6cf1d74-c6e8-4530-b06d-ded8baebd47f", "8cbb60c1-62f2-4dd6-ad38-bc37d41801fd", "5400d57e-f3b2-48dd-917a-7f75730e0e64", "b786b366-4bb6-46e0-8179-5b1e33e2714b", "761e5bd4-e99e-4063-9b47-f22a259b1ed1", "70aeef96-aa39-4d3c-8f7b-8459f84f2cb3", "5a8f06d0-df28-4e55-a849-da31ffc77712", "01b317bf-6100-48ed-bc6f-2d7da1926174", "188b4397-f01d-477a-8ad4-731e95480e6c"]	2026-01-16 01:00:23.178	2026-01-16 01:03:16.005	Curated by the Baha Men Themselves	https://open.spotify.com/playlist/37i9dQZF1E8Ty9UWY32v40	spotify
\.

COPY public.session (sid, sess, expire) FROM stdin;
xd1mwzA9Uxqa86Un4k4uDSEr_ZqwAR-c	{"cookie": {"path": "/", "secure": false, "expires": "2026-01-22T22:28:15.741Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": "a5d72513-90e2-4efe-ac6a-4a6766cf86aa", "username": "nickjantz"}	2026-01-22 22:31:29
wrro9bswqXB9HHJ8KpShcy2oGDxWfesz	{"cookie": {"path": "/", "secure": false, "expires": "2026-01-22T23:08:28.569Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": "a5d72513-90e2-4efe-ac6a-4a6766cf86aa", "username": "nickjantz"}	2026-01-23 01:21:50
\.

COPY public."MagicToken" (id, token, "userId", "expiresAt", "createdAt", username, email) FROM stdin;
\.

COPY public."PasswordResetToken" (id, token, "userId", "expiresAt", "createdAt") FROM stdin;
\.

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
26858967-9e29-4ab2-83de-c7c999736eee	b1dcaa782ccb12a4fe3d130ce691b417fca215d28a2903415cf632491547ff3d	2026-01-14 23:18:59.451602+00	20260114231859_init	\N	\N	2026-01-14 23:18:59.422522+00	1
dd393901-1177-4f7c-b7fb-c1c5eb1c88c3	0f003c93a7f28e5a7764172db59297a52f8d48d0e786444f869948620a8b633d	2026-01-14 23:30:34.499022+00	20260114233034_add_magic_code_reg	\N	\N	2026-01-14 23:30:34.494597+00	1
e50dfbc6-2d20-4f62-9823-90c2831ca4cb	e488bdf0582be0fea5569d047f2376789e6ad981565c9c32eed9168b1fc11d32	2026-01-15 02:45:52.426873+00	20260115024552_add_email_and_password_reset	\N	\N	2026-01-15 02:45:52.412203+00	1
2b99b324-081c-4829-8f07-1e575071d23a	8f8c014432d30ac3e11b32159994f09bb7a7f07219e7106ef779b1b3cedc2e1a	2026-01-15 03:21:52.303344+00	20260115032152_make_username_optional_and_add_email_to_magic_token	\N	\N	2026-01-15 03:21:52.299619+00	1
60e5f245-beea-41f0-880f-03c5cf55f5cd	73b7c8de991517926e69fd1514ede99c11127c20d35a19d1c37a031e59525051	2026-01-15 17:09:10.091273+00	20260116000000_add_session_table		\N	2026-01-15 17:09:10.091273+00	0
2011d5d1-24ab-48ea-b622-7c21d88e414c	f3177c40c95a80203f072029ade2192fb2356c10bd94dd01b6ba9d316d4d7aef	2026-01-15 17:25:53.400927+00	20260117000000_add_playlist_source_fields		\N	2026-01-15 17:25:53.400927+00	0
106a15c7-3550-4044-be05-9f4454f1da28	ee59f8debd6f99ac77958bc8863b783d3b4c741fe4a22a87d9adcb85ac44bdf0	2026-01-15 17:25:58.387258+00	20260119000000_add_last_synced_at		\N	2026-01-15 17:25:58.387258+00	0
55d7eeef-48c5-4518-a5d4-25ddc6dfa684	8de970d72e4b6c3cd45eb0ab4eea4afb86919c2210ed321e05c7d3b29842dc15	2026-01-15 23:46:48.304252+00	20260121000000_make_songs_global		\N	2026-01-15 23:46:48.304252+00	0
efb4786b-2b0a-47e1-b894-b72e0a78b324	08eb75adf7ec7dbfb5de656af410ed244b5b9d76121cd555e02f44bf140be8d6	2026-01-15 23:48:06.890082+00	20260122000000_remove_user_song		\N	2026-01-15 23:48:06.890082+00	0
e81be04e-8a1d-4351-8312-b6a408e83a68	0a672f792a59b24ad44040c743373ac9f6c4526eb4849bd167216931acfc6a5e	2026-01-15 23:48:07.499516+00	20260125000000_add_expected_song_count		\N	2026-01-15 23:48:07.499516+00	0
fe814e7c-cdbb-4ba8-83ed-76dbe7da17bb	b8eccb1091f060788db79f49d77fdfa8bb0ca6ddbeb981a6e7c2870096cced80	2026-01-15 23:50:47.387321+00	20260126000000_add_homepage_feed		\N	2026-01-15 23:50:47.387321+00	0
\.

