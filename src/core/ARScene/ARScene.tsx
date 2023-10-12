import { Canvas } from "@react-three/fiber"
import {
    ARButton,
    Controllers,
    Interactive,
    XR,
    XREvent,
    XRManagerEvent,
    useHitTest,
} from "@react-three/xr"
import { useRef, useState } from "react"
import { useCookies } from "react-cookie"
import { IconContext } from "react-icons"
import { FaChevronLeft } from "react-icons/fa6"
import { useNavigate } from "react-router-dom"
import { generateUUID } from "three/src/math/MathUtils.js"
import { saveProject } from "../../api"
import { Button } from "../../components/button"
import { CoordinateTable } from "../../components/coordinate-table"
import { TextField } from "../../components/text-field"
import { Marker } from "./Marker"

interface MarkerObj {
    position: THREE.Vector3
}

export const ARScene = () => {
    const [cookies] = useCookies(["userUID"])
    const [projName, setProjName] = useState("")

    const [isARMode, setIsARMode] = useState(false)

    const markerRef = useRef<THREE.Mesh>(null!)
    const [markerColor, setMarkerColor] = useState<any>("blue")

    const [markers, setMarkers] = useState<React.ReactElement[]>([])
    const [dirty, setDirty] = useState(false)

    const [sessionEnd, setSessionEnd] = useState(false)

    const MarkerPreview = () => {
        useHitTest((hitMatrix: THREE.Matrix4) => {
            hitMatrix.decompose(
                markerRef.current.position,
                markerRef.current.quaternion,
                markerRef.current.scale
            )
        })

        const handleOnSelect = () => {
            setMarkerColor((Math.random() * 0xffffff) | 0)
            markerArray.current.push({ position: markerRef.current.position })

            const uuid = generateUUID()
            setMarkers((markers) => [
                ...markers,
                <Marker
                    key={uuid}
                    name=""
                    position={markerRef.current.position}
                />,
            ])
            setDirty(!dirty)
        }

        return (
            <Interactive onSelect={handleOnSelect}>
                <mesh ref={markerRef} receiveShadow castShadow>
                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                    <meshStandardMaterial color={markerColor} />
                </mesh>
            </Interactive>
        )
    }

    const markerArray = useRef<MarkerObj[]>([])
    const [show, setShow] = useState(false)

    const onSessionStart = (event: XREvent<XRManagerEvent>) => {
        markerArray.current = []
        setIsARMode(true)
        setShow(false)
    }
    const onSessionEnd = () => {
        setIsARMode(false)
        setShow(true)
        setSessionEnd(true)
    }

    const navigate = useNavigate()

    const handleSaveSuccess = () => {}
    const handleSaveFail = () => {}

    return (
        <div
            className={
                "flex h-full flex-col items-center gap-8 text-neutral-800"
            }
        >
            {!isARMode && (
                <div className="flex w-full justify-between p-4">
                    <IconContext.Provider value={{ size: "24px" }}>
                        <a
                            onClick={() => navigate(-1)}
                            className="cursor-pointer"
                        >
                            <FaChevronLeft />
                        </a>
                    </IconContext.Provider>
                </div>
            )}

            {!isARMode && (
                <div className="flex h-full flex-col items-center justify-center gap-10 p-4">
                    {show ? (
                        <>
                            <p className="text-xl font-semibold">
                                Markers&apos; Results
                            </p>

                            {markerArray.current.length ? (
                                <>
                                    <CoordinateTable>
                                        {markerArray.current.map(
                                            (item, idx) => (
                                                <CoordinateTable.Row
                                                    key={`row-${idx}`}
                                                >
                                                    <CoordinateTable.Column>
                                                        Marker {idx + 1}
                                                    </CoordinateTable.Column>

                                                    <CoordinateTable.Column>
                                                        {item.position.x.toFixed(
                                                            3
                                                        )}
                                                    </CoordinateTable.Column>

                                                    <CoordinateTable.Column>
                                                        {item.position.y.toFixed(
                                                            3
                                                        )}
                                                    </CoordinateTable.Column>

                                                    <CoordinateTable.Column>
                                                        {item.position.z.toFixed(
                                                            3
                                                        )}
                                                    </CoordinateTable.Column>
                                                </CoordinateTable.Row>
                                            )
                                        )}
                                    </CoordinateTable>

                                    <div className="flex flex-col items-center gap-4">
                                        <p className="text-center text-xs">
                                            Happy with the result? If not, you
                                            can try again!
                                        </p>

                                        <span className="[&>*]:text-neutral-800">
                                            <TextField
                                                onChange={(event) =>
                                                    setProjName(
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Project Name"
                                            />
                                        </span>

                                        <div className="flex gap-4">
                                            <Button onClick={() => navigate(0)}>
                                                No
                                            </Button>

                                            <Button
                                                onClick={() =>
                                                    saveProject(
                                                        cookies.userUID,
                                                        {
                                                            markers:
                                                                markerArray,
                                                        },
                                                        projName,
                                                        handleSaveSuccess,
                                                        handleSaveFail
                                                    )
                                                }
                                                disabled={projName === ""}
                                            >
                                                Yes!
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-center">
                                    <p>Hmm, there are no markers here.</p>
                                    <p>
                                        Please try to scan again and remember to
                                        tap the marker at the right position!
                                    </p>
                                    <div>
                                        <Button onClick={() => navigate(0)}>
                                            Try again
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <p className="text-xl font-semibold">
                                Seems like there&apos;s nothing here yet :&#40;
                            </p>
                        </>
                    )}

                    <p className="text-center italic sm:hidden">
                        Editor is currently unavailable for mobile, please
                        access it from your PC or from a device with larger
                        screen.
                    </p>
                </div>
            )}

            {!sessionEnd && <ARButton />}

            <div className="h-full w-full">
                <Canvas>
                    <XR
                        referenceSpace="local"
                        onSessionStart={onSessionStart}
                        onSessionEnd={onSessionEnd}
                    >
                        {isARMode && (
                            <>
                                <ambientLight />
                                <pointLight position={[10, 10, 10]} />
                                <MarkerPreview />
                                <Controllers />

                                <mesh
                                    position={[1000, 1000, 1000]}
                                    visible={dirty}
                                >
                                    <boxGeometry args={[0.1, 0.1, 0.1]} />
                                </mesh>

                                {markers.map((m) => (
                                    <>{m}</>
                                ))}
                            </>
                        )}
                    </XR>
                </Canvas>
            </div>
        </div>
    )
}
