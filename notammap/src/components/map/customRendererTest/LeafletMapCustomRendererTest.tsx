import { LeafletMap } from "../LeafletMap";

export function LeafletMapCustomRendererTest() {
    function initMap(map: L.Map) {
        console.log(map);
    }

    return (
        <div style={{ width: 800, height: 800 }}>
            <LeafletMap
                mapId="customRendererTest"
                onInit={initMap}
                newCords={[50, 15]}
                newZoom={5}
                layers={[
                    {
                        tmsUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
                        name: "Standard",
                        type: "base",
                        defaultActive: true,
                        maxZoom: 14,
                        minZoom: 0,
                        opacity: 0.6,
                        attributions: [
                            {
                                name: "OpenStreetMap",
                                url: "http://www.openstreetmap.org/copyright",
                            },
                        ],
                    },
                ]}
            ></LeafletMap>
        </div>
    );
}
