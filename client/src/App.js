import React, { useState } from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation } from '@apollo/client';
import { createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useAppBridge } from '@shopify/app-bridge-react';
import { Layout, Page, Button, Card, Spinner, Toast } from '@shopify/polaris';
import CollectionSelector from './CollectionSelector';
import ProductGrid from './ProductGrid';
import ProductList from './ProductList';
import { GET_COLLECTIONS, GET_COLLECTION_PRODUCTS, REORDER_PRODUCTS } from './graphql';

const App = () => {
  const app = useAppBridge();
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [products, setProducts] = useState([]);
  const [toast, setToast] = useState({ message: '', error: false });

  const httpLink = createHttpLink({ uri: '/graphql' });
  const authLink = setContext(async (_, { headers }) => ({
    headers: { ...headers },
  }));
  const client = new ApolloClient({ link: authLink.concat(httpLink), cache: new InMemoryCache() });

  const { data: collectionsData, loading: collectionsLoading } = useQuery(GET_COLLECTIONS, { client });
  const { data: productsData, loading: productsLoading, refetch } = useQuery(GET_COLLECTION_PRODUCTS, {
    variables: { id: selectedCollection?.id },
    skip: !selectedCollection,
    client,
    onCompleted: (data) => setProducts(data.collection.products.edges.map(edge => edge.node)),
  });
  const [reorderProducts] = useMutation(REORDER_PRODUCTS, { client });

  const handleReorder = async (newOrder) => {
    const moves = newOrder.map((prod, index) => ({ id: prod.id, newPosition: `${index}` }));
    try {
      const { data } = await reorderProducts({ variables: { id: selectedCollection.id, moves } });
      if (data.collectionReorderProducts.userErrors.length) {
        setToast({ message: data.collectionReorderProducts.userErrors[0].message, error: true });
      } else {
        refetch();
        setToast({ message: 'Order saved', error: false });
      }
    } catch (error) {
      setToast({ message: error.message, error: true });
    }
  };

  const collections = (collectionsData?.collections.edges.map(edge => edge.node) || [])
    .filter(c => c.sortOrder === 'MANUAL')
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <ApolloProvider client={client}>
      <Page title="Visual Collection Arranger">
        <Layout>
          <Layout.Section>
            {collectionsLoading ? <Spinner /> : (
              <CollectionSelector collections={collections} onSelect={setSelectedCollection} />
            )}
          </Layout.Section>
          {selectedCollection && (
            <Layout.Section>
              <Card>
                {productsLoading ? <Spinner /> : (
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '70%' }}>
                      <ProductGrid products={products} onReorder={setProducts} />
                    </div>
                    <div style={{ width: '30%' }}>
                      <ProductList products={products} onReorder={setProducts} />
                    </div>
                  </div>
                )}
                <Button primary onClick={() => handleReorder(products)}>Save Order</Button>
                <Button onClick={refetch}>Refresh</Button>
              </Card>
            </Layout.Section>
          )}
        </Layout>
        {toast.message && <Toast content={toast.message} error={toast.error} onDismiss={() => setToast({})} />}
      </Page>
    </ApolloProvider>
  );
};

export default App;
