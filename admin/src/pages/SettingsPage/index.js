/*
 *
 * HomePage
 *
 */

import React, { memo, useEffect, useState, useCallback, useMemo } from "react";

import {
  Typography,
  Tooltip,
  ToggleInput,
  Card,
  Flex,
  Box,
  BaseHeaderLayout,
  Layout,
  ContentLayout,
  TextInput,
  Button,
} from "@strapi/design-system";
import Information from "@strapi/icons/Information";
import { request } from "@strapi/helper-plugin";
import axiosInstance from "../../utils/axiosInstance";

const useSettings = () => {
  const [settings, setSettings] = useState(null);
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (settings?.destinationURL) {
      setUrl(settings?.destinationURL);
    }
  }, [settings]);

  useEffect(() => {
    request("/migration-plugin/get-settings")
      .then((res) => setSettings(res))
      .catch((_e) => setSettings(null));
  }, []);

  const toggleSettings = useCallback((newSettings) => {
    axiosInstance
      .put(`/migration-plugin/toggle-settings/${newSettings.id}`, {
        migrationAllowed: newSettings.migrationAllowed,
      })
      .then(({ data }) => setSettings(data))
      .catch((_e) => setSettings(null));
  }, []);

  const updateURL = useCallback((destinationURL) => {
    axiosInstance
      .post(`/migration-plugin/post-url/`, {
        destinationURL,
      })
      .then(({ data }) => setUrl(data.destinationURL))
      .catch((_e) => setUrl(""));
  }, []);

  return { settings, toggleSettings, updateURL, url };
};

const CustomToggle = (props) => {
  const [checked, setChecked] = useState(props.migrationAllowed);

  const toggle = () => {
    setChecked((prev) => {
      props.toggleSettings({ ...props, migrationAllowed: !prev });
      return !prev;
    });
  };

  return (
    <ToggleInput
      hint={`Enable migration for ${props.singularName}`}
      label={props.singularName}
      name="enable-provider"
      onLabel="on"
      offLabel="off"
      checked={checked}
      onChange={toggle}
      labelAction={
        <Tooltip description={`Enable migration for ${props.singularName}`}>
          <button
            aria-label="Information about the email"
            style={{
              border: "none",
              padding: 0,
              background: "transparent",
            }}
          >
            <Information aria-hidden={true} />
          </button>
        </Tooltip>
      }
    />
  );
};
const urlRegex = new RegExp(
  "(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})"
);

const CustomInput = (props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(props?.destinationURL || "");

  const error = useMemo(() => {
    if (content.length === 0) {
      return "This needs to be filled";
    }
    return !content.match(urlRegex) ? "This is not URL!" : undefined;
  }, [content]);

  const onEdit = () => {
    if (isEditing) {
      setIsEditing((p) => {
        props.updateURL(content);
        return !p;
      });
    } else {
      setIsEditing((p) => !p);
    }
  };

  return (
    <Flex>
      <TextInput
        disabled={!isEditing}
        style={{ width: 400 }}
        label="Destination URL:"
        name="content"
        hint="URL Where you want to migrate your contents"
        error={error}
        onChange={(e) => setContent(e.target.value)}
        value={content}
        labelAction={
          <Tooltip description="Content of the tooltip">
            <button
              aria-label="Information about the email"
              style={{
                border: "none",
                padding: 0,
                background: "transparent",
              }}
            >
              <Information aria-hidden={true} />
            </button>
          </Tooltip>
        }
      />
      <Button onClick={onEdit}>{isEditing ? "Save" : "Edit"}</Button>
    </Flex>
  );
};

const SettingsPage = () => {
  const { settings, toggleSettings, updateURL } = useSettings();

  return (
    <Box background="neutral100">
      <Layout>
        <BaseHeaderLayout title="Migration plugin - Settings" as="h2" />

        <ContentLayout>
          <Flex background="neutral100">
            {!settings?.contentTypes ? (
              <div style={{ width: 500 }}>
                <Box background="danger500" padding={5}>
                  <Typography>No Content Types Found!</Typography>
                </Box>
              </div>
            ) : (
              <Flex direction="column" alignItems="start">
                <CustomInput
                  destinationURL={settings.destinationURL}
                  updateURL={updateURL}
                />
                <Typography style={{ marginTop: 10 }}>
                  Content Types:
                </Typography>
                {settings.contentTypes.map((type) => (
                  <Card
                    padding={4}
                    style={{ width: 400, margin: "10px 0" }}
                    key={type.id}
                  >
                    <CustomToggle {...type} toggleSettings={toggleSettings} />
                  </Card>
                ))}
              </Flex>
            )}
          </Flex>
        </ContentLayout>
      </Layout>
    </Box>
  );
};

export default memo(SettingsPage);
