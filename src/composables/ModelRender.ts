import * as THREE from 'three'
import { sRGBEncoding } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { gsap } from 'gsap'
import { useScreenState } from '~/stores/screenState'

/////////////////////////////
// Variables
/////////////////////////////
let canvas: HTMLCanvasElement
let scene: THREE.scene
let renderer: THREE.renderer
let camera: THREE.PerspectiveCamera
let projectListPage = true
const projectModels: object[] = []
let scrollY: number = window.scrollY
const modelDistance = 4

/////////////////////////////
// Define the main 3D scene
/////////////////////////////
export const useThreeInit = (canvasRef: HTMLCanvasElement) => {

  canvas = unref(canvasRef)

  const screenState = useScreenState()

  screenState.setScreenStates()

  /////////////////////////////
  // Initial Setup
  /////////////////////////////
  renderer = new THREE.WebGL1Renderer({
    canvas,
    alpha: true,
    antialias: true
  })
  renderer.outputEncoding = sRGBEncoding
  scene = new THREE.Scene()

  const screenChange = () => {
    screenState.setScreenStates()

    camera.aspect = screenState.screenWidth / screenState.screenHeight
    camera.updateProjectionMatrix()

    renderer.setSize(screenState.screenWidth, screenState.screenHeight)

    renderer.setPixelRatio(screenState.getDevicePixelRatio)

  }
  /////////////////////////////
  // Light
  /////////////////////////////
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.5)

  keyLight.position.set(-2, 0, 4)
  scene.add(ambientLight, keyLight)

  /////////////////////////////
  // Event Listeners
  /////////////////////////////
  window.addEventListener('resize', screenChange)
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY
  })

  camera = new THREE.PerspectiveCamera(35, screenState.screenWidth / screenState.screenHeight, 0.1, 100)
  camera.position.z = 5

  screenChange()

  scene.add(camera)

  const render = () => {

    if (projectListPage) {
      camera.position.y = -scrollY / screenState.screenHeight * modelDistance // + 2 TODO - Add once header is complete
    }

    renderer.render(scene, camera)
    window.requestAnimationFrame(render)
  }
  requestAnimationFrame(render)
}

export const rotateModel = (modelScene: GLTFLoader) => {
  const duration = 4
  const distance = 0.2

  gsap.fromTo(modelScene.rotation, {
    y: -distance
  }, {
    y: distance,
    duration: duration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyoEase: true
  })
}

export const projectPageSetter = (index: number, noAnimation = false) => {
  // console.log(projectModels[index])
  projectListPage = false

  const screenState = useScreenState()

  screenState.setScreenStates()

  // console.log(camera.position.y)

  if (noAnimation) {
    gsap.set(camera.position, {
      y: -index * 4 - 0.5
    })
    gsap.set(canvas, {
      position: 'absolute',
      onStart: () => {
        gsap.set(canvas, {
          zIndex: 4
        })
      },
      onComplete: () => {
        gsap.set(canvas, {
          position: 'absolute',
          zIndex: -2,
          delay: 0.8
        })
      }
    })
  }
  else {
    gsap.to(camera.position, {
      y: -index * 4 - 0.5,
      duration: 0.5,
      onStart: () => {
        gsap.set(canvas, {
          zIndex: 4
        })
      },
      onComplete: () => {
        gsap.set(canvas, {
          position: 'absolute',
          zIndex: -2,
          delay: 0.8
        })
      }
    })
  }
  // camera.position.y =
  // console.log(camera.position.y)
}

export const projectPageExiter = () => {

  console.log('Exiting page')

  /////////////////////////////
  // TODO - Make a smoother transition
  /////////////////////////////
  projectListPage = true
  gsap.set(canvas, {
    position: 'fixed'
  })
}

export const addProjectModels = (models: string[]) => {

  const gltfLoader = new GLTFLoader()

  for (let index = 0; index < models.length; index++) {
    const model = models[index]

    gltfLoader.load(model, (gltf: GLTFLoader) => {

      const modelScene = gltf.scene

      projectModels.push(modelScene)

      rotateModel(modelScene)

      modelScene.scale.x = 1
      modelScene.scale.y = 1
      modelScene.scale.z = 1
      modelScene.position.y = - modelDistance * index

      scene.add(modelScene)
    })
  }
}

export const hideProjectModels = () => {

  for (let i = 0; i < projectModels.length; i++) {
    console.log(projectModels[i])
  }
}


