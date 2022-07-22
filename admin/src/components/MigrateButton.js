import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Divider } from '@strapi/design-system';
import { useCMEditViewDataManager, request } from '@strapi/helper-plugin';

import axiosInstance from '../utils/axiosInstance';

const useMigrationButton = (slug) => {
  const [isMigrationEnabled, setIsMigrationEnabled] = useState(false);

  useEffect(() => {
    request(`/migration-plugin/is-migration-enabled/${slug}`)
      .then((res) => {
        setIsMigrationEnabled(!!res?.isMigrationEnabled);
      })
      .catch((_e) => setIsMigrationEnabled(false));
  }, []);

  return isMigrationEnabled;
};

export default function MigrateButton() {
  const { initialData, slug, modifiedData, isCreatingEntry } = useCMEditViewDataManager();
  const isMigrationEnabled = useMigrationButton(slug);
  // TODO: add notifications
  //   const toggleNotification = useNotification();

  if (!isMigrationEnabled) {
    return null;
  }

  const onMigrateClick = () => {
    axiosInstance
      .post(`/migration-plugin/migrate/${slug}/${initialData.id}`)
      .then((res) => console.log(res))
      .catch((e) => console.log(e));
  };

  // TODO: add translations
  // TODO: add new texts
  return (
    <Box
      as='aside'
      aria-labelledby='versioning-informations'
      background='neutral0'
      borderColor='neutral150'
      hasRadius
      paddingBottom={4}
      paddingLeft={4}
      paddingRight={4}
      paddingTop={6}
      shadow='tableShadow'
    >
      <Typography variant='sigma' textColor='neutral600' id='versioning-informations'>
        Migrace na produkci
      </Typography>
      <Box paddingTop={2} paddingBottom={6}>
        <Divider />
      </Box>

      <Typography variant='omega'>Poslední migrace: </Typography>

      <Box paddingBottom={3}>
        <Button variant='danger-light' onClick={onMigrateClick} fullWidth disabled={isCreatingEntry}>
          Migrovat na produkci
        </Button>
      </Box>

      <Typography variant='pi'>Bla bla o tom jak je to nebezpecne</Typography>
    </Box>
  );
}
