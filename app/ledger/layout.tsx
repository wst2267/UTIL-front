export default function LayoutComponent({children}: {children: React.ReactNode}) {
    return (
        <section style={{backgroundColor: "gray", padding: "1px 5px 5px 5px"}}>
            {children}
        </section>
    )
}