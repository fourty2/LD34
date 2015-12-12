

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
		var FAR = 1000;
		var FOV = 45;


		this.gamecanvas = document.getElementById('gamecanvas');
		this.renderer = new THREE.WebGLRenderer({canvas: this.gamecanvas});
		this.renderer.setSize(WIDTH, HEIGHT);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMapSoft = true;

		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera(FOV, WIDTH /  HEIGHT, NEAR, FAR);
		this.camera.position.set(0,210,-60);
		this.camera.position.set(-300, 800, 500);
		this.scene.add(this.camera);

		var light = new THREE.DirectionalLight(0xffffff, 2);
		light.position.set(-100,100,0);
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
		this.ground = 
				new THREE.Mesh(
					new THREE.PlaneGeometry(100,1000,16),
					new THREE.MeshPhongMaterial({color:0xfafaff, side:THREE.DoubleSide})
					);

		this.ground.position.set(0, 0,400);
		this.ground.receiveShadow = true;
		this.ground.rotation.x = (Math.PI / 2) + (Math.PI / 8);
		
		for (var i = 0; i<20; i++) {
			var mesh = new THREE.Mesh(
					new THREE.CylinderGeometry(1,8, 25,8),
					new THREE.MeshPhongMaterial({color: 0x007000, shading: THREE.FlatShading})
				);
			mesh.castShadow =  true;
			mesh.position.set(Math.random() * 100 - 60, 185 - (i * 22), i * 50);
			this.scene.add(mesh);
			this.trees.push(mesh);
		}


		this.scene.add(this.ground);
		
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

		var geometry = new THREE.PlaneBufferGeometry(512, 512, resWidth - 1, resLength - 1);
		geometry.rotateX( - Math.PI /2 );
		var vertices = geometry.attributes.position.array;

		var data = this.generateHeight(resWidth, resLength);

		var texture = new THREE.CanvasTexture(this.generateTexture(data, resWidth, resLength));
		
		// j+3 weil es immer drei positionsvektoren sind, und wir nur y ändern wollen
		for (var i=0, j=0, l = vertices.length; i<l;i++,j+=3) {
			vertices[j + 1] = data[i];
			vertices[j + 1] -= Math.floor(j * 0.001);
		}

		mesh = new THREE.Mesh(
			geometry,
			new THREE.MeshBasicMaterial({map: texture})
			);

		mesh.receiveShadow = true;
		mesh.position.z += 300;
		this.scene.add(mesh);

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
				data[i] += Math.abs( perlin.noise(x / quality, y / quality, z) * quality *  1.05)

			}
			quality *= 4;
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
		for (var i=0, j=0,l = imageData.length; i<l;i+=4, j++) {

				v3.x = data[j - 2] - data[j + 2];
				v3.y = 1;
				v3.z = data[j - width * 2] - data[j + width * 2];
				v3.normalize();

				shade = v3.dot(new THREE.Vector3(-1,1,0));

				var height = data [ j ];
				imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.01);
				imageData[i + 1 ] = (96 + shade * 128) * (0.5 + data[j] * 0.01);
				imageData[i + 2] = (96 + shade * 128)  * (0.5 + data[j] * 0.01);
				//imageData[i + 1] = Math.random() * 200;
				//imageData[i + 2] = Math.random() * 200;

		}
		context.putImageData(image, 0,0);


		var canvasScaled = document.createElement('canvas');
		canvasScaled.width = width * 4;
		canvasScaled.height = height * 4;
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
		return canvas;

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
			ld34.playerMesh.position.x-=1;
		}
		if (ld34.pressed.left) {
			ld34.velocity.x += 1;
			ld34.playerMesh.position.x+=1;		
		}



		this.velocity.z = 1;
		this.velocity.y = -1;

		// nach unten schauen, ob ground getroffen wird.
		// wenn nicht, dann velocity erhöhen		

		var bottomPoint = ld34.playerMesh.position.clone();
		bottomPoint.y -= ld34.playerMesh.scale.x * 10;

		ld34.raycaster.set(bottomPoint,
							new THREE.Vector3(0,-1,0));
		var intersect = ld34.raycaster.intersectObject( ld34.ground );
		if (!intersect[0]) {
			//var distance = intersect[0].distance
			//this.velocity.y = -1;
			this.velocity.y = 0;			
		} else {
			this.velocity.y -= 1;
		}

		// damping
		if (Math.abs(ld34.velocity.x) > 0) {
			ld34.velocity.x *= 0.5;
		}

		ld34.playerMesh.position.z += ld34.velocity.z;
		ld34.playerMesh.position.y += ld34.velocity.y * 0.3;
		ld34.playerMesh.position.x += ld34.velocity.x;



		// das per physik

	//	ld34.playerMesh.position.z +=1;
		ld34.playerMesh.rotateX(0.1 / ld34.playerMesh.scale.x);
	//	ld34.playerMesh.position.y-=0.43;

		if (ld34.playerMesh.position.z > 1000) {
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
			ld34.renderer.setClearColor(0x000000,1);
		}


		ld34.camera.position.z = ld34.playerMesh.position.z; - 80;
		//ld34.camera.position.y = ld34.playerMesh.position.y + 50;
		ld34.camera.lookAt(ld34.playerMesh.position);
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