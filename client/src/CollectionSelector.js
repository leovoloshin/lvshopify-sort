import React, { useState } from 'react';
import { Select, TextField, Stack } from '@shopify/polaris';

const CollectionSelector = ({ collections, onSelect }) => {
  const [search, setSearch] = useState('');
  const filtered = collections.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <Stack vertical>
      <TextField label="Search Collections" value={search} onChange={setSearch} />
      <Select
        label="Select Collection"
        options={filtered.map(c => ({ label: `${c.title} (${c.handle})`, value: c.id }))}
        onChange={(value) => onSelect(collections.find(c => c.id === value))}
      />
    </Stack>
  );
};

export default CollectionSelector;