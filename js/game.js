

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
		//this.camera.position.set(-300, 400, 250);
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

		




		window.addEventListener('keydown', ld34.kbInputDown);
		window.addEventListener('keyup', ld34.kbInputUp);
		this.animate();
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
			ld34.playerMesh.position.x-=1;
		}
		if (ld34.pressed.left) {
			ld34.playerMesh.position.x+=1;		
		}

		// das per physik

		ld34.playerMesh.position.z +=1;
		ld34.playerMesh.rotateX(0.1 / ld34.playerMesh.scale.x);
		ld34.playerMesh.position.y-=0.43;

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


		ld34.camera.position.z = ld34.playerMesh.position.z - 80;
		ld34.camera.position.y = ld34.playerMesh.position.y + 50;
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