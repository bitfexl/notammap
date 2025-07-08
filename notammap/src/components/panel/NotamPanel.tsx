export interface NotamPanelProps {}

export function NotamPanel({}: NotamPanelProps) {
    return (
        <div>
            <h2>Notam</h2>

            {new Array(20).fill(
                <div>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi possimus aliquam, qui dolorem magnam doloribus ea eaque
                    illum voluptate atque? Incidunt molestiae facere iusto quia! Ab fugit officiis illum repellendus.
                </div>
            )}
        </div>
    );
}
