import { MockController } from 'src/adapters/mocked_data/controller';
import MainContent from '~core/MainContent';

export const LocalContent = ({query}: {query: string}) => {
    return (
        <main style={{width: "100%", height: 700, display: "flex", overflow: "hidden"}}>
            <MainContent controller={MockController}
                initialQuery={query}
            />
        </main>
    );
}
