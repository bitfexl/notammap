import { LeftSidePanel } from "./LeftSidePanel";

export interface NotamPanelProps {
    height: string;
}

export function NotamPanel({ height }: NotamPanelProps) {
    return (
        <LeftSidePanel height={height}>
            <div>
                <h2>Notam</h2>

                {new Array(20).fill(
                    <div>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi possimus aliquam, qui dolorem magnam doloribus ea
                        eaque illum voluptate atque? Incidunt molestiae facere iusto quia! Ab fugit officiis illum repellendus.
                    </div>
                )}
            </div>
        </LeftSidePanel>
    );
}
