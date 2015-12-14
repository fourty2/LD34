

var ld34 = {
	gameState: 0,
	pressed: {
		left: false,
		right: false
	},
	points: 0,
	trees: [],
	init: function() {
		var WIDTH = window.innerWidth;
		var HEIGHT = window.innerHeight;
		var NEAR = 0.1;
		var FAR = 5000;
		var FOV = 45;

		this.clock = new THREE.Clock();

		this.gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: this.gamecanvas});
		this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0x000510,1);
		this.scene = new THREE.Scene();
		this.scene.fog = new THREE.FogExp2(0x000510, 0.0002);

		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH /  HEIGHT, NEAR, FAR);
		//this.camera.position.set(0,210,-60);
		this.camera.position.set(-800, 1000, 1000);
		this.scene.add(this.camera);

		var alight = new THREE.AmbientLight(0x303030);
		this.scene.add(alight);


		var light = new THREE.DirectionalLight(0xFFA030, 3);
		light.position.set(-1600,200,500);
		light.castShadow = true;		
		this.scene.add(light);

		this.playerGeo = new THREE.SphereGeometry(10,8,8);
		this.playerMaterial = new THREE.MeshPhongMaterial({
							color: 0x8888c0,
							shading: THREE.FlatShading
						});

		this.playerMesh = new THREE.Mesh(
				this.playerGeo, 
				this.playerMaterial
			);
		this.playerMesh.position.set(0,180,0);
		this.playerMesh.castShadow = true;
		this.loader =  new THREE.JSONLoader();

		this.generateWorld();


		//this.scene.add(this.ground);
		
		this.scene.add(this.playerMesh);

		// camera nachziehen
		this.camera.lookAt(this.playerMesh.position);

		this.raycaster = new THREE.Raycaster(); 

		this.velocity = new THREE.Vector3(0,0,0);

		window.addEventListener('keydown', ld34.kbInputDown);
		window.addEventListener('keyup', ld34.kbInputUp);
		this.animate();
	},
	generateWorld: function() {


		var newWorld = new THREE.SphereBufferGeometry(1000,64,64);




		var resWidth = 512,	resLength = 512;
		var resHalfWidth = resWidth / 2, resHalfLength = resLength / 2;

		var geometry = new THREE.PlaneBufferGeometry(512, 3840, resWidth - 1, resLength - 1);
		geometry.rotateX( - Math.PI /2 );
		var vertices = geometry.attributes.position.array;

		this.heightMapData = this.generateHeight(resWidth, resLength);

		var texture = new THREE.CanvasTexture(this.generateTexture(this.heightMapData, resWidth, resLength));
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		
		// j+3 weil es immer drei positionsvektoren sind, und wir nur y ändern wollen
		for (var i=0, j=0, l = vertices.length; i<l;i++,j+=3) {
			vertices[j + 1] = this.heightMapData[i];
			var y = ~~ (i / 512);
			

			vertices[j + 1] += Math.floor((Math.sin(y * 0.03) / (y * 0.03)) * 1000); //Math.abs((Math.sin(y * 0.05) / (y * 0.05)) * 10);
			//console.log(Math.sin(j * 0.0001) / (j * 0.0001)) * 10;
		}

		// wieviele bäume? an den rändern jeweils 
		// 100 bäume an den rändern





		var newWorldMesh = new THREE.Mesh(
			newWorld,
			new THREE.MeshBasicMaterial({map: texture})
			);
		ld34.scene.add(newWorldMesh);		


		ld34.ground = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({map: texture})
			);

		ld34.ground.receiveShadow = true;
		ld34.ground.position.z += 3840 / 2;
		ld34.scene.add(ld34.ground);

		ld34.loader.load( 'tanne.json', function ( geometry, materials ) {
			

			console.log("tanne loaded");
			for (var i = 0; i<=50; i++) {

				var mesh = new THREE.Mesh(
						geometry,
						 new THREE.MeshFaceMaterial(materials)
					);
				mesh.castShadow =  true;

				var desiredZ = Math.random() * 3800;
				var desiredX = -128 + Math.random() * 256;
				var desiredY = ld34.heightMapData[(Math.floor(desiredZ / 15) * 256) /*+ (desiredX + 128)*/ ]
								+ Math.floor(
								(Math.sin((desiredZ / 15) * 0.03)  /
										((desiredZ / 15) * 0.03)
									) * 1000) ;


				mesh.position.set(desiredX, 
						desiredY,
						desiredZ);
				mesh.scale.set(3,3,3);
				
				ld34.scene.add(mesh);
				ld34.trees.push(mesh);
			}
	
			for (var i = 0; i<500; i++) {
			console.log("a tree");


			var mesh = new THREE.Mesh(
					geometry,
					new THREE.MeshFaceMaterial(materials)
				);
			mesh.castShadow =  true;
			// an den linken rand
			var desiredZ = Math.random() * 3800;
			var desiredX = 200 + Math.random() * 60;
			var desiredY = ld34.heightMapData[(Math.floor(desiredZ / 15) * 256) /*+ (desiredX + 128)*/ ]
							+ Math.floor(
							(Math.sin((desiredZ / 15) * 0.03)  /
									((desiredZ / 15) * 0.03)
								) * 1000) + (Math.random() * 30);


			mesh.position.set(desiredX, 
					desiredY,
					desiredZ);
			mesh.scale.set(3,3,3);
			ld34.scene.add(mesh);
			ld34.trees.push(mesh);


			// und an den rechten rand
			var mesh = new THREE.Mesh(
					geometry,
					new THREE.MeshFaceMaterial(materials)
				);
			mesh.castShadow =  true;

			var desiredZ = Math.random() * 3800;
			var desiredX = -250 + Math.random() * 60;
			var desiredY = ld34.heightMapData[(Math.floor(desiredZ / 15) * 256) /*+ (desiredX + 128)*/ ]
							+ Math.floor(
							(Math.sin((desiredZ / 15) * 0.03)  /
									((desiredZ / 15) * 0.03)
								) * 1000) ;


			mesh.position.set(desiredX, 
					desiredY,
					desiredZ);
			mesh.scale.set(3,3,3);
			ld34.scene.add(mesh);
			ld34.trees.push(mesh);

		
		}

		



		} );






	},
	generateHeight(width, height) {
		var size = width * height;
		var data = new Uint8Array(size);
		var z = Math.random() * 100;
		var perlin = new ImprovedNoise();
		var quality = 1;

		for (var j = 0; j<4; j++) {
			for (var i =0; i < size; i++) {
				var x = i % width; y = ~~ (i / width);
				data[i] += Math.abs( perlin.noise(x / quality, y / quality, z) * quality *  0.8)
				//data[i] += Math.floor(Math.sin(y * 0.01) / (y  * 0.01) * 10);
			}
			quality *= 2;
		}

		return data;
	},
	generateTexture: function(data, width, height) {

		var canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		context = canvas.getContext('2d');
		context.fillStyle = '#000';
		context.fillRect(0, 0, width, height);

		image = context.getImageData(0,0,canvas.width, canvas.height);
		imageData = image.data;

		var v3 = new THREE.Vector3(0,0,0);
		var shade;
		var sun = new THREE.Vector3(-1,1,0);
		for (var i=0, j=0,l = imageData.length; i<l;i+=4, j++) {

				v3.x = data[j - 2] - data[j + 2];
				v3.y = 1;
				v3.z = data[j - width * 2] - data[j + width * 2];
				v3.normalize();

				shade = v3.dot(sun);

				//var height = data [ j ];
				imageData[i] = (128 + shade * 128) * (0.8 + data[j] * 0.01);
				imageData[i + 1 ] = (128 + shade * 128) * (0.8 + data[j] * 0.01);
				imageData[i + 2] = (128 + shade * 128)  * (0.8 + data[j] * 0.01);
				//imageData[i + 1] = Math.random() * 200;
				//imageData[i + 2] = Math.random() * 200;

		}
		context.putImageData(image, 0,0);


		var canvasScaled = document.createElement('canvas');
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
		console.log(canvasScaled);
		context = canvasScaled.getContext('2d');
		context.scale(4,4);
		context.drawImage(canvas, 0,0);

		image = context.getImageData(0,0,canvasScaled.width, canvasScaled.height);
		imageData = image.data;
		for (var i=0, l = imageData.length; i<l;i+=4) {
			var v = ~~ (Math.random() * 5);		
			imageData[i] += v;
			imageData[i + 1] += v;
			imageData[i + 2] += v;

		}
		context.putImageData(image, 0, 0);
		return canvasScaled;

	},
	kbInputDown: function(e) {
		switch (e.keyCode) {
			case 37:
				ld34.pressed.left = true;
			break;
			case 39:
				ld34.pressed.right = true;
			break;
		}
	},
	kbInputUp: function(e) {
		switch (e.keyCode) {
			case 37:
				ld34.pressed.left = false;
			break;
			case 39:
				ld34.pressed.right = false;
			break;
		}
	},
	updatePlayer: function() {
		if (ld34.pressed.right) {
			ld34.velocity.x -= 1;
		}
		if (ld34.pressed.left) {
			ld34.velocity.x += 1;
		}

		

		this.velocity.z = 3;
		// damping
		if (Math.abs(ld34.velocity.x) > 0) {
			ld34.velocity.x *= 0.8;
		}

		ld34.playerMesh.position.z += ld34.velocity.z;
//	ld34.playerMesh.position.y += ld34.velocity.y;
		ld34.playerMesh.position.x += ld34.velocity.x;

	ld34.playerMesh.position.y =
	Math.floor(
		(Math.sin((ld34.playerMesh.position.z / 15) * 0.03)  /
				((ld34.playerMesh.position.z / 15) * 0.03)
			) * 1000)
	+ (15 * ld34.playerMesh.scale.x);
	
//this.heightMapData[(Math.floor(ld34.playerMesh.position.z / 15) * 256)  ]
	//+ 





		// das per physik

	//	ld34.playerMesh.position.z +=1;
		ld34.playerMesh.rotateX(0.3 / ld34.playerMesh.scale.x);
	//	ld34.playerMesh.position.y-=0.43;

		if (ld34.playerMesh.position.z > 3800) {
			ld34.playerMesh.position.set(0,180,0);
		}

		// bewegungsvektor normalisieren
		// -> velocity benutzen

		ld34.raycaster.set(ld34.playerMesh.position,
							new THREE.Vector3(0,-1,0.4));
		var intersects = ld34.raycaster.intersectObjects( ld34.trees );

		if (intersects.length) {
			
			ld34.renderer.setClearColor(0x600000,1);
			if (ld34.playerMesh.scale.x > 0.5) {
				ld34.playerMesh.scale.x = ld34.playerMesh.scale.x * 0.95;
				ld34.playerMesh.scale.y = ld34.playerMesh.scale.y * 0.95;
				ld34.playerMesh.scale.z = ld34.playerMesh.scale.z * 0.95;

			}
		} else {
			if (ld34.playerMesh.scale.x < 10) {
				ld34.playerMesh.scale.x = ld34.playerMesh.scale.x * 1.001;
				ld34.playerMesh.scale.y = ld34.playerMesh.scale.y * 1.001;
				ld34.playerMesh.scale.z = ld34.playerMesh.scale.z * 1.001;
			}
			ld34.renderer.setClearColor(0x000510,1);
		}
	
			
	/*	ld34.camera.position.z = ld34.playerMesh.position.z - 120;
		ld34.camera.position.y = ld34.playerMesh.position.y + 100;
		ld34.camera.position.x = ld34.playerMesh.position.x;
		*/
		ld34.camera.lookAt(new THREE.Vector3(ld34.playerMesh.position.x, ld34.playerMesh.position.y + 30, ld34.playerMesh.position.z ));
		ld34.points+=0.1;


	},
	updatePoints: function() {
		elem = document.getElementById('points');
		elem.innerHTML = 'Size: ' + (ld34.playerMesh.scale.x * 10).toFixed(2)
						+ " - Punkte: " + Math.floor(ld34.points);
	},
	animate: function() {		
		ld34.updatePlayer();
		ld34.updatePoints();
		ld34.renderer.render(ld34.scene, ld34.camera);
		window.requestAnimationFrame(ld34.animate);
	}
}

ld34.init();