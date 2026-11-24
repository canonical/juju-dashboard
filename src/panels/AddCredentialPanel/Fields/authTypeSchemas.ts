/* eslint-disable @cspell/spellchecker -- This file contains values as they come from Juju */
import type { AuthTypeSchema } from "./types";

/**
 * Authentication type schemas for each cloud provider.
 *
 * Usage example:
 *   const schema = AUTH_TYPE_SCHEMAS["ec2"];
 *   const authTypes = Object.keys(schema.authTypes);          // dropdown options
 *   const fields = schema.authTypes["access-key"];             // form fields
 */
export const AUTH_TYPE_SCHEMAS: Record<string, AuthTypeSchema> = {
  // ---------------------------------------------------------------------------
  // AWS  (provider type: "ec2")
  // ---------------------------------------------------------------------------
  ec2: {
    displayName: "Amazon Web Services (EC2)",
    authTypes: {
      "access-key": [
        {
          name: "access-key",
          label: "Access Key",
          inputType: "text",
          optional: false,
        },
        {
          name: "secret-key",
          label: "Secret Key",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Azure  (provider type: "azure")
  // ---------------------------------------------------------------------------
  azure: {
    displayName: "Microsoft Azure",
    authTypes: {
      // Azure-specific auth-type (not a global Juju constant).
      // Equivalent to a service-principal with a client secret.
      "service-principal-secret": [
        {
          name: "application-id",
          label: "Application ID",
          inputType: "text",
          optional: false,
          format: "uuid",
        },
        {
          name: "application-object-id",
          label: "Application Object ID",
          inputType: "text",
          optional: true,
          format: "uuid",
        },
        {
          name: "subscription-id",
          label: "Subscription ID",
          inputType: "text",
          optional: false,
          format: "uuid",
        },
        {
          name: "managed-subscription-id",
          label: "Managed Subscription ID",
          inputType: "text",
          optional: true,
          format: "uuid",
        },
        {
          name: "application-password",
          label: "Application Password",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
      ],

      // Credentials are sourced from an Azure User-Assigned Managed Identity
      // attached to the VM — no password stored.
      "managed-identity": [
        {
          name: "managed-identity-path",
          label: "Managed Identity Path",
          inputType: "text",
          optional: false,
        },
        {
          name: "subscription-id",
          label: "Subscription ID",
          inputType: "text",
          optional: false,
          format: "uuid",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Google Cloud (GCE)  (provider type: "gce")
  // ---------------------------------------------------------------------------
  gce: {
    displayName: "Google Cloud (GCE)",
    authTypes: {
      oauth2: [
        {
          name: "client-id",
          label: "Client ID",
          inputType: "text",
          optional: false,
        },
        {
          name: "client-email",
          label: "Client Email",
          inputType: "text",
          optional: false,
          format: "email",
        },
        {
          name: "private-key",
          label: "Private Key",
          inputType: "textarea",
          optional: false,
          sensitive: true,
          format: "pem",
        },
        {
          name: "project-id",
          label: "Project ID",
          inputType: "text",
          optional: false,
        },
      ],

      // The user supplies a GCP service-account JSON key file.
      // File is read locally and content is parsed to string before submission.
      jsonfile: [
        {
          name: "file",
          label: "Service Account JSON File",
          inputType: "file",
          optional: false,
          format: "json",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // OpenStack  (provider type: "openstack")
  // ---------------------------------------------------------------------------
  openstack: {
    displayName: "OpenStack",
    authTypes: {
      userpass: [
        {
          name: "username",
          label: "Username",
          inputType: "text",
          optional: false,
        },
        {
          name: "password",
          label: "Password",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
        {
          name: "tenant-name",
          label: "Tenant Name",
          inputType: "text",
          optional: true,
        },
        {
          name: "tenant-id",
          label: "Tenant ID",
          inputType: "text",
          optional: true,
        },
        {
          name: "version",
          label: "Identity Version",
          inputType: "text",
          optional: true,
        },
        {
          name: "domain-name",
          label: "Domain Name",
          inputType: "text",
          optional: true,
        },
        {
          name: "project-domain-name",
          label: "Project Domain Name",
          inputType: "text",
          optional: true,
        },
        {
          name: "user-domain-name",
          label: "User Domain Name",
          inputType: "text",
          optional: true,
        },
        // TODO(juju-4.1): Add trust-id field when targeting Juju >= 4.1.
        // Merged into main via https://github.com/juju/juju/pull/22457 (not in 4.0).
        // Source: internal/provider/openstack/credentials.go - CredAttrTrustID = "trust-id"
        //
        // {
        //   name: "trust-id",
        //   label: "Trust ID",
        //   inputType: "text",
        //   optional: true,
        //   Mutually exclusive with tenant-name, tenant-id and domain-name.
        //   Only valid with version: "3" (Keystone v3).
        //   The UI should clear / disable those fields when trust-id is non-empty.
        // },
      ],

      "access-key": [
        {
          name: "access-key",
          label: "Access Key",
          inputType: "text",
          optional: false,
        },
        {
          name: "secret-key",
          label: "Secret Key",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
        {
          name: "tenant-name",
          label: "Tenant Name",
          inputType: "text",
          optional: true,
        },
        {
          name: "tenant-id",
          label: "Tenant ID",
          inputType: "text",
          optional: true,
        },
        {
          name: "version",
          label: "Identity Version",
          inputType: "text",
          optional: true,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // MAAS  (provider type: "maas")
  // ---------------------------------------------------------------------------
  maas: {
    displayName: "MAAS",
    authTypes: {
      oauth1: [
        {
          name: "maas-oauth",
          label: "OAuth / API Key",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // LXD  (provider type: "lxd")
  // ---------------------------------------------------------------------------
  lxd: {
    displayName: "LXD",
    authTypes: {
      // TLS mutual-auth using pre-exchanged certificates.
      // Users paste PEM-encoded certificate/key content in textarea fields.
      certificate: [
        {
          name: "server-cert",
          label: "Server Certificate",
          inputType: "textarea",
          optional: false,
          sensitive: true,
          format: "pem",
        },
        {
          name: "client-cert",
          label: "Client Certificate",
          inputType: "textarea",
          optional: false,
          sensitive: true,
          format: "pem",
        },
        {
          name: "client-key",
          label: "Client Key",
          inputType: "textarea",
          optional: false,
          sensitive: true,
          format: "pem",
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Kubernetes (provider type: "kubernetes")
  // Note: Field names (Token, ClientCertificateData, ClientKeyData) must match
  // Juju's caas/kubernetes/cloud schemas verbatim — do not normalize to kebab-case.
  // ---------------------------------------------------------------------------
  kubernetes: {
    displayName: "Kubernetes",
    authTypes: {
      userpass: [
        {
          name: "username",
          label: "Username",
          inputType: "text",
          optional: false,
        },
        {
          name: "password",
          label: "Password",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
      ],

      oauth2: [
        {
          name: "Token",
          label: "Bearer Token",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
        {
          name: "rbac-id",
          label: "RBAC ID",
          inputType: "text",
          optional: true,
        },
      ],

      clientcertificate: [
        {
          name: "ClientCertificateData",
          label: "Client Certificate Data",
          inputType: "textarea",
          optional: false,
          format: "pem",
        },
        {
          name: "ClientKeyData",
          label: "Client Key Data",
          inputType: "textarea",
          optional: false,
          sensitive: true,
          format: "pem",
        },
        {
          name: "rbac-id",
          label: "RBAC ID",
          inputType: "text",
          optional: true,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Oracle Cloud Infrastructure  (provider type: "oci")
  // ---------------------------------------------------------------------------
  oci: {
    displayName: "Oracle Cloud Infrastructure (OCI)",
    authTypes: {
      httpsig: [
        {
          name: "user",
          label: "User OCID",
          inputType: "text",
          optional: false,
        },
        {
          name: "tenancy",
          label: "Tenancy OCID",
          inputType: "text",
          optional: false,
        },
        {
          name: "key",
          label: "Private Key",
          inputType: "textarea",
          optional: false,
          sensitive: true,
          format: "pem",
        },
        {
          name: "pass-phrase",
          label: "Passphrase",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
        {
          name: "fingerprint",
          label: "Fingerprint",
          inputType: "text",
          optional: false,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // VMware vSphere  (provider type: "vsphere")
  // ---------------------------------------------------------------------------
  vsphere: {
    displayName: "VMware vSphere",
    authTypes: {
      userpass: [
        {
          name: "user",
          label: "Username",
          inputType: "text",
          optional: false,
        },
        {
          name: "password",
          label: "Password",
          inputType: "password",
          optional: false,
          sensitive: true,
        },
        {
          name: "vmfolder",
          label: "VM Folder",
          inputType: "text",
          optional: true,
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------
  // Unmanaged / Manual  (provider type: "unmanaged" in Juju >= 4.0, "manual" in 2.9/3.x)
  // No credential attributes — Juju uses the "empty" auth-type.
  // ---------------------------------------------------------------------------
  unmanaged: {
    displayName: "Unmanaged / Manual",
    authTypes: {
      empty: [],
    },
  },

  // Manual cloud type for Juju 2.9/3.x compatibility
  manual: {
    displayName: "Manual",
    authTypes: {
      empty: [],
    },
  },
};
