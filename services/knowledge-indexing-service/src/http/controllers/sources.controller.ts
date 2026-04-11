import type {
  CreateSourceRequest,
  CreateSourceResponse,
  DisableSourceResponse,
  ListSourcesResponse,
  TriggerSourceSyncResponse,
  UpdateSourceRequest,
  UpdateSourceResponse,
  UploadSourceAssetResponse
} from '../../../../../packages/contracts/src/indexing/source.contract.ts'
import type { KnowledgeIndexingApplication } from '../../knowledge-indexing.application.ts'

export class SourcesController {
  private readonly application: KnowledgeIndexingApplication

  constructor(application: KnowledgeIndexingApplication) {
    this.application = application
  }

  list(tenantId: string): Promise<ListSourcesResponse> {
    return this.application.listSources(tenantId)
  }

  create(input: { tenantId: string } & CreateSourceRequest): Promise<CreateSourceResponse> {
    return this.application.createSource(input)
  }

  disable(input: { tenantId: string; sourceId: string }): Promise<DisableSourceResponse> {
    return this.application.disableSource(input)
  }

  update(input: { tenantId: string; sourceId: string } & UpdateSourceRequest): Promise<UpdateSourceResponse> {
    return this.application.updateSource(input)
  }

  upload(input: {
    tenantId: string
    sourceId: string
    fileName: string
    mimeType: string
    base64Data: string
  }): Promise<UploadSourceAssetResponse> {
    return this.application.uploadSourceAsset(input)
  }

  sync(input: { tenantId: string; sourceId: string }): Promise<TriggerSourceSyncResponse> {
    return this.application.triggerSourceSync(input)
  }
}
