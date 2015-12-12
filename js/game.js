

var ld34 = {
	gameState: 0,
	pressed: {
		left: false,
		right: false
	},
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
		this.camera.position.set(0,40,-100);
		this.scene.add(this.camera);

		var light = new THREE.DirectionalLight(0xffffff, 2);
		light.position.set(-1,1,0);
		light.castShadow = true;


		
		this.scene.add(light);
		// @todo später wegen licht schauen
//		this.scene.add(new THREE.CameraHelper(light));

		this.playerGeo = new THREE.SphereGeometry(10,16,16);
		this.playerMaterial = new THREE.MeshPhongMaterial({
							color: 0x8888c0,
							shading: THREE.FlatShading
						});

		this.playerMesh = new THREE.Mesh(
				this.playerGeo, 
				this.playerMaterial
			);
		this.playerMesh.position.set(0,10,0);
		this.playerMesh.castShadow = true;



		// das dann generieren
		this.ground = 
				new THREE.Mesh(
					new THREE.PlaneGeometry(100,400,1),
					new THREE.MeshPhongMaterial({color:0xfafaff, side:THREE.DoubleSide})
					);

		this.ground.receiveShadow = true;
		this.ground.rotation.x = Math.PI / 2;
		this.ground.position.set(0,0,0);

		this.scene.add(this.ground);
		
		this.scene.add(this.playerMesh);

		// camera nachziehen
		this.camera.lookAt(this.playerMesh.position);



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

		ld34.camera.lookAt(ld34.playerMesh.position);

	},
	animate: function() {		
		ld34.updatePlayer();

		ld34.renderer.render(ld34.scene, ld34.camera);
		window.requestAnimationFrame(ld34.animate);
	}
}

ld34.init();