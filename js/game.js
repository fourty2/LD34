

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


		this.gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: this.gamecanvas});
		this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMapSoft = true;
		this.renderer.setClearColor(0xc0c0c0,1);
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH /  HEIGHT, NEAR, FAR);
		this.camera.position.set(0,210,-60);
		//this.camera.position.set(-800, 1000, 1000);
		this.scene.add(this.camera);

		var light = new THREE.DirectionalLight(0xffffc0, 3);
		light.position.set(-1000,1000,0);
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


		this.generateWorld();



		// das dann generieren
	/*	this.ground = 
				new THREE.Mesh(
					new THREE.PlaneGeometry(100,1000,16),
					new THREE.MeshPhongMaterial({color:0xfafaff, side:THREE.DoubleSide})
					);

		this.ground.position.set(0, 0,400);
		this.ground.receiveShadow = true;
		this.ground.rotation.x = (Math.PI / 2) + (Math.PI / 8);
		*/
	/*	for (var i = 0; i<20; i++) {
			var mesh = new THREE.Mesh(
					new THREE.CylinderGeometry(1,8, 25,8),
					new THREE.MeshPhongMaterial({color: 0x007000, shading: THREE.FlatShading})
				);
			mesh.castShadow =  true;
			mesh.position.set(Math.random() * 100 - 60, 185 - (i * 22), i * 50);
			this.scene.add(mesh);
			this.trees.push(mesh);
		}
*/

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


		var resWidth = 256,	resLength = 256;
		var resHalfWidth = resWidth / 2, resHalfLength = resLength / 2;

		var geometry = new THREE.PlaneBufferGeometry(256, 3840, resWidth - 1, resLength - 1);
		geometry.rotateX( - Math.PI /2 );
		var vertices = geometry.attributes.position.array;

		this.heightMapData = this.generateHeight(resWidth, resLength);

		var texture = new THREE.CanvasTexture(this.generateTexture(this.heightMapData, resWidth, resLength));
		texture.wrapS = THREE.ClampToEdgeWrapping;
		texture.wrapT = THREE.ClampToEdgeWrapping;
		
		// j+3 weil es immer drei positionsvektoren sind, und wir nur y ändern wollen
		for (var i=0, j=0, l = vertices.length; i<l;i++,j+=3) {
			vertices[j + 1] = this.heightMapData[i];
			var y = ~~ (i / 256);
			

			vertices[j + 1] += Math.floor((Math.sin(y * 0.03) / (y * 0.03)) * 1000); //Math.abs((Math.sin(y * 0.05) / (y * 0.05)) * 10);
			//console.log(Math.sin(j * 0.0001) / (j * 0.0001)) * 10;
		}

		// wieviele bäume? an den rändern jeweils 
		// 100 bäume an den rändern








		ld34.ground = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({map: texture})
			);

		ld34.ground.receiveShadow = true;
		ld34.ground.position.z += 3840 / 2;
		ld34.scene.add(ld34.ground);


		for (var i = 0; i<1000; i++) {
			console.log("a tree");
			var mesh = new THREE.Mesh(
					new THREE.CylinderGeometry(1,8, 40,8),
					new THREE.MeshPhongMaterial({color: 0x007000, shading: THREE.FlatShading})
				);
			mesh.castShadow =  true;
			// an den linken rand
			var desiredZ = Math.random() * 3800;
			var desiredX = 98 + Math.random() * 60;
			var desiredY = ld34.heightMapData[(Math.floor(desiredZ / 15) * 256) /*+ (desiredX + 128)*/ ]
							+ Math.floor(
							(Math.sin((desiredZ / 15) * 0.03)  /
									((desiredZ / 15) * 0.03)
								) * 1000) + (Math.random() * 30);


			mesh.position.set(desiredX, 
					desiredY,
					desiredZ);
			
			ld34.scene.add(mesh);
			ld34.trees.push(mesh);


			// und an den rechten rand
			var mesh = new THREE.Mesh(
					new THREE.CylinderGeometry(1,8, 40,8),
					new THREE.MeshPhongMaterial({color: 0x007000, shading: THREE.FlatShading})
				);
			mesh.castShadow =  true;

			var desiredZ = Math.random() * 3800;
			var desiredX = -150 + Math.random() * 60;
			var desiredY = ld34.heightMapData[(Math.floor(desiredZ / 15) * 256) /*+ (desiredX + 128)*/ ]
							+ Math.floor(
							(Math.sin((desiredZ / 15) * 0.03)  /
									((desiredZ / 15) * 0.03)
								) * 1000) + (Math.random() * 30);


			mesh.position.set(desiredX, 
					desiredY,
					desiredZ);
			
			ld34.scene.add(mesh);
			ld34.trees.push(mesh);

		
		}

		for (var i = 0; i<=100; i++) {
				// und noch auf der strecke

			var mesh = new THREE.Mesh(
					new THREE.CylinderGeometry(1,8, 40,8),
					new THREE.MeshPhongMaterial({color: 0x007000, shading: THREE.FlatShading})
				);
			mesh.castShadow =  true;

			var desiredZ = Math.random() * 3800;
			var desiredX = -128 + Math.random() * 256;
			var desiredY = ld34.heightMapData[(Math.floor(desiredZ / 15) * 256) /*+ (desiredX + 128)*/ ]
							+ Math.floor(
							(Math.sin((desiredZ / 15) * 0.03)  /
									((desiredZ / 15) * 0.03)
								) * 1000) + 30;


			mesh.position.set(desiredX, 
					desiredY,
					desiredZ);
			
			ld34.scene.add(mesh);
			ld34.trees.push(mesh);
		}



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
			ld34.renderer.setClearColor(0xc0c0c0,1);
		}
	
			
		ld34.camera.position.z = ld34.playerMesh.position.z - 120;
		ld34.camera.position.y = ld34.playerMesh.position.y + 100;
		ld34.camera.position.x = ld34.playerMesh.position.x;
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